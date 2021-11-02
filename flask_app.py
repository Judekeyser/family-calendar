from flask       import Flask, g, request, render_template, redirect
from json        import dumps, loads
from os          import environ

import db_bridge
import secure_bridge
import browser_security_response_headers


###############################################################################
####################  ENVIRONMENT CONFIGURATION VARIABLES  ####################

DATABASE_URL              = environ.get('DATABASE_URL')
ENCRYPTION_KEY_SECRET     = environ.get('ENCRYPTION_KEY_SECRET')
HASH_KEY_SECRET           = environ.get('HASH_KEY_SECRET')
AUTHENTICATION_KEY_SECRET = environ.get('AUTHENTICATION_KEY_SECRET')
PASSWORD                  = environ.get('PASSWORD')
MUTE_SECURITY             = environ.get('MUTE_SECURITY')


###############################################################################
##############  DATABASE QUERY BINDINGS WITH GLOBAL FLASK OBJECT  #############

def insert_event (data):
    return db_bridge.insert_event(data, g.db)

def get_from_date (time):
    return db_bridge.get_from_date(time, g.db)


###############################################################################
########################  GATEWAYS TO SECURITY MODULE  ########################

def get_csrf_token ():
    token = secure_bridge.random_word()
    return token .decode('ascii')

def auth_cookie_name():
    return '__Host-authtoken' if MUTE_SECURITY is None else 'authtoken'

class Authentifier:
    def __init__(self, request):
        token_session = request.cookies.get(auth_cookie_name())
        self.token_session = token_session .encode('ascii') if (
                                 token_session is not None
                             ) else None

        auth_request = request.headers.get('Authentication')
        auth_request = auth_request .encode('ascii') if (
                          auth_request is not None
                       ) else None

        enc_key = ENCRYPTION_KEY_SECRET .encode('ascii')
        hash_key = HASH_KEY_SECRET .encode('ascii')
        auth_key = AUTHENTICATION_KEY_SECRET .encode('ascii')
        password = PASSWORD .encode('ascii')

        token = secure_bridge.auth_strategy(self.token_session,
            8*60*60, 24*60*60,
            auth_request,
            enc_key, hash_key, auth_key, password
        )
        if token is not None:
            self.secure_token = token .decode('ascii')
        else:
            self.secure_token = None

        setattr(request, '__authentifier', self)

    def validates_request (self):
        return self.secure_token is not None

    def alters_cookies (self, c_consumer):
        if not self .validates_request():
            c_consumer(auth_cookie_name(), '', 0)
        elif self.secure_token == self.token_session:
            return
        else:
            c_consumer(auth_cookie_name(), self.secure_token, 23*60*60)


###############################################################################
##############  FLASK DECORATORS TO TOKENS AND SECURITY CONCERNS  #############

def csrf_cookie_name():
    return '__Host-csrftoken' if MUTE_SECURITY is None else 'csrftoken'


###############################################################################
###############  FLASK SET UP (CONFIGURATION AND ROUTE GUARDS)  ###############

flask_app = Flask(__name__,
    static_folder = 'assets'
)

@flask_app.after_request
def add_browser_security_headers(response):
    def h_consumer (key, value):
        response.headers[key] = value
    browser_security_response_headers .apply(h_consumer, MUTE_SECURITY is None)
    return response

@flask_app.after_request
def add_content_type (response):
   if request.endpoint in ('send_event', 'fetch_events'):
       type = 'application/json'
   elif request.endpoint == '':
       type = 'text/html'
   else:
       return response
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
def csrf_guard():
    if request.endpoint in ('send_event' 'fetch_events'):
        csrf_token_from_cookie = request.cookies.get(csrf_cookie_name())
        csrf_token_from_header = request.headers.get('X-Csrf-Token')
        if not csrf_token_from_header == csrf_token_from_cookie:
            return flask_app.response_class(
                response = 'Untrusted request',
                status = 403,
                mimetype = 'application/json'
            )

@flask_app.before_request
def auth_token_guard():
    if request.endpoint in ('send_event', 'fetch_events'):
        authentifier = Authentifier (request)
        if getattr(request, '__authentifier') is not authentifier:
            raise Exception("Corrupted script: unset __authentifier")
        if not authentifier .validates_request():
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

@flask_app.route('/', methods = ['GET'])
def main_page():
    return __main_page()

@flask_app.route('/send_event', methods = ['POST'])
def send_event():
    if not request.headers.get('Content-Type') == 'application/json':
        raise Exception("Malformed request does not prove JSON content type")
    return __send_event()

@flask_app.route('/fetch_events', methods = ['GET'])
def fetch_events():
    return __fetch_events()


###############################################################################
###############################  BUSINESS UNITS  ##############################

def __main_page():
    csrf_token = get_csrf_token()
    html_content = render_template('index.htm',
               csrf_token = csrf_token,
               base_url = "http://localhost:5000" if (
                             MUTE_SECURITY is not None
                          ) else "https://family-calendar.herokuapp.com"
    )
    response = flask_app.response_class(
            response = html_content,
            status = 200,
            mimetype = 'text/html'
    )
    response.set_cookie(csrf_cookie_name(), csrf_token,
            max_age = 24*60*60,
            secure = MUTE_SECURITY is None,
            httponly = True,
            path = '/',
            domain = None,
            samesite = 'Strict'
    )
    return response

def __send_event ():
    provided = request.json
    truncated = dumps(request.json) .encode('utf-8')[:512]
    if not provided == loads(truncated):
        raise Error("Invalid JSON Input, likely too long")
    time = insert_event (truncated)
    return dumps(time)

def __fetch_events():
    time = request.args.get('from', type=int)

    def convert_event(data, timeTrack):
        return [loads(data.decode('utf-8')), timeTrack]
    
    return dumps([convert_event(*event) for event in get_from_date(time)])


###############################################################################
###################  MAIN PROCESS TRIGGERS FLASK RUN POINT   ##################

if __name__ == '__main__':
    flask_app.run()
