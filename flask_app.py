from flask       import Flask, g, request, render_template, redirect
from json        import dumps, loads
from os          import environ

import db_bridge
import secure_bridge


###############################################################################
####################  ENVIRONMENT CONFIGURATION VARIABLES  ####################

DATABASE_URL              = environ.get('DATABASE_URL')
ENCRYPTION_KEY_SECRET     = environ.get('ENCRYPTION_KEY_SECRET')
HASH_KEY_SECRET           = environ.get('HASH_KEY_SECRET')
AUTHENTICATION_KEY_SECRET = environ.get('AUTHENTICATION_KEY_SECRET')
PASSWORD                  = environ.get('PASSWORD')
MUTE_SECURITY             = environ.get('MUTE_SECURITY')


###############################################################################
###############################  BUSINESS UNITS  ##############################

__default_headers = {
    "Content-Security-Policy": "default-src 'none'; connect-src 'self'; font-src https://fonts.gstatic.com;img-src 'none'; object-src 'none'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'",
    "X-Frame-Options": "none",
    "Referrer-Policy": "no-referrer",
    "Feature-Policy": "camera 'none'; fullscreen 'self'; geolocation 'none'; microphone 'none'",
    "X-Permitted-Cross-Domain-Policies": "none",
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff"
}

__ssl_ctx_headers = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
}

def apply_security_http_headers (h_consumer, ssl_ctx):
    global __default_headers, __ssl_ctx_headers
    for key in __default_headers:
        h_consumer(key, __default_headers[key])

    if not ssl_ctx:
        return
    for key in __ssl_ctx_headers:
        h_consumer(key, __ssl_ctx_headers[key])


###############################################################################
##############  DATABASE QUERY BINDINGS WITH GLOBAL FLASK OBJECT  #############

def insert_event (data):
    return db_bridge.insert_event(data, g.db)

def get_from_date (time):
    return db_bridge.get_from_date(time, g.db)


###############################################################################
########################  GATEWAYS TO SECURITY MODULE  ########################

def csrf_cookie_name():
    return '__Host-csrftoken' if MUTE_SECURITY is None else 'csrftoken'

def auth_cookie_name():
    return '__Host-authtoken' if MUTE_SECURITY is None else 'authtoken'

class Authentifier:
    def __init__(self,
        token_session = None,
        authentification = None,
        csrf_cookie = None,
        csrf_header = None
    ):
        self.csrf_cookie = csrf_cookie
        self.csrf_header = csrf_header
        self.token_session, authentification = [
          w.encode('ascii') if w is not None else None for w in (
            token_session, authentification
          )
        ]

        enc_key = ENCRYPTION_KEY_SECRET .encode('ascii')
        hash_key = HASH_KEY_SECRET .encode('ascii')
        auth_key = AUTHENTICATION_KEY_SECRET .encode('ascii')
        password = PASSWORD .encode('ascii')

        token = secure_bridge.auth_strategy(
            self.token_session,
            8*60*60, 24*60*60,
            authentification,
            enc_key, hash_key, auth_key, password
        )
        if token is not None:
            self.secure_token = token .decode('ascii')
        else:
            self.secure_token = None

    def reset_csrf_token (self):
        self.csrf_cookie = None
        self.csrf_header = secure_bridge.random_word().decode('ascii')
        return self.csrf_header

    def validates_request (self):
        return self.csrf_cookie is not None and \
               self.csrf_cookie == self.csrf_header

    def authentifies_user (self):
        return self.secure_token is not None

    def alters_cookies (self, c_consumer):
        if not self .authentifies_user():
            c_consumer(auth_cookie_name(), '', 0)
        else:
            c_consumer(auth_cookie_name(), self.secure_token, 23*60*60)
        if not self .validates_request() and self.csrf_header is not None:
            c_consumer(csrf_cookie_name(), self.csrf_header, 24*60*60)


###############################################################################
###############  FLASK SET UP (CONFIGURATION AND ROUTE GUARDS)  ###############

flask_app = Flask(__name__,
    static_folder = 'assets'
)

@flask_app.after_request
def add_browser_security_headers(response):
    def h_consumer (key, value):
        response.headers[key] = value
    apply_security_http_headers(h_consumer, MUTE_SECURITY is None)
    return response

@flask_app.after_request
def add_content_type (response):
    if request.endpoint in ('send_event', 'fetch_events'):
        type = 'application/json'
    elif request.endpoint == 'main_page':
        type = 'text/html; charset=UTF-8'
    elif request.endpoint == 'hidden_csrf_token':
        type = 'text/javascript'
    else:
        type = None

    if type is not None:
        response.headers['Content-Type'] = type
    return response

@flask_app.after_request
def set_authentication_cookie (response):
    def c_consumer(name, content, max_age):
        response.set_cookie(
            name, content,
            max_age = max_age,
            secure = MUTE_SECURITY is None,
            httponly = True,
            path = '/',
            domain = None,
            samesite = 'Strict'
        )
    authentifier = getattr(request, '__authentifier', None)
    if authentifier is not None:
        authentifier .alters_cookies (c_consumer)
    return response

@flask_app.before_request
def prepare_connection_object():
    db = getattr(g, 'db', None)
    if db is None:
        g.db = db_bridge.open_connection(DATABASE_URL)

@flask_app.before_request
def ssl_guard():
    if MUTE_SECURITY is None:
        if not request.is_secure:
           return redirect('https://family-calendar.herokuapp.com',
               code = 301
           )

@flask_app.before_request
def auth_token_guard():
    if request.endpoint in ('send_event', 'fetch_events', 'hidden_csrf_token'):
        authentifier = Authentifier (
          token_session = request.cookies.get(auth_cookie_name()),
          authentification = request.headers.get('Authentication'),
          csrf_cookie = request.cookies.get(csrf_cookie_name()),
          csrf_header = request.headers.get('X-Csrf-Token')
        )
        setattr(request, '__authentifier', authentifier)
    if request.endpoint in ('send_event', 'fetch_events'):
        if not authentifier .validates_request():
            return flask_app.response_class(
                response = 'Untrusted request',
                status = 403,
                mimetype = 'application/json'
            )
        elif not authentifier .authentifies_user():
            return flask_app.response_class(
                response = 'Unauthentified user',
                status = 401,
                mimetype = 'application/json'
            )

@flask_app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'db'):
        g.db.close()


###############################################################################
################################  FLASK ROUTES  ###############################

@flask_app.route('/hiddenCsrfToken.js', methods = ['GET'])
def hidden_csrf_token():
    csrf_token = getattr(request, '__authentifier', None).reset_csrf_token()
    js_content = render_template(
        'hiddenCsrfToken.js',
        csrf_token = csrf_token,
    )
    response = flask_app.response_class(
            response = js_content,
            status = 200
    )
    return response

@flask_app.route('/', methods = ['GET'])
def main_page():
    return flask_app.send_static_file('index.htm')

@flask_app.route('/send_event', methods = ['POST'])
def send_event():
    if not request.headers.get('Content-Type') == 'application/json':
        raise Exception("Malformed request does not prove JSON content type")
    provided = request.json
    truncated = dumps(request.json) .encode('utf-8')[:512]
    if not provided == loads(truncated):
        raise Exception("Invalid JSON Input, likely too long")
    time = insert_event (truncated)
    return dumps(time)

@flask_app.route('/fetch_events', methods = ['GET'])
def fetch_events():
    time = request.args.get('from', type=int)

    def convert_event(data, timeTrack):
        return [loads(data.decode('utf-8')), timeTrack]
    
    return dumps([convert_event(*event) for event in get_from_date(time)])


###############################################################################
###################  MAIN PROCESS TRIGGERS FLASK RUN POINT   ##################

if __name__ == '__main__':
    flask_app.run()
