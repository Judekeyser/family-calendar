from flask       import Flask, g, request, render_template, redirect
from json        import dumps, loads
from os          import environ

import db_bridge
import secure_bridge


###############################################################################
####################  ENVIRONMENT CONFIGURATION VARIABLES  ####################

import os
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

def get_secure (binary_token, auth_scheme_recover):
    enc_key = ENCRYPTION_KEY_SECRET .encode('ascii')
    hash_key = HASH_KEY_SECRET .encode('ascii')
    auth_key = AUTHENTICATION_KEY_SECRET .encode('ascii')
    password = PASSWORD .encode('ascii')

    token = secure_bridge.auth_strategy(binary_token, 1*60*60, 24*60*60,
        auth_scheme_recover,
        enc_key, hash_key, auth_key, password
    )
    return token.decode('ascii') if token is not None else None


###############################################################################
###########@###  FLASK SET UP (CONFIGURATION AND ROUTE GUARDS)  ###@###########

flask_app = Flask(__name__,
    static_folder = 'assets'
)

@flask_app.before_request
def before_request():
    db = getattr(g, 'db', None)
    if db is None:
        g.db = db_bridge.open_connection(DATABASE_URL)

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
    # TODO: Current this route allows smth else than
    # Content-Type: applicatin/json and when it happens, null is stored in db
    # It should not be... change this
    
    return __send_event()

@flask_app.route('/fetch_events', methods = ['GET'])
def fetch_events():
    return __fetch_events()


###############################################################################
###############################  BUSINESS UNITS  ##############################

def with_browser_security_enforced (f):
    def K(*args, **kwargs):
        flask_response = f(*args, **kwargs)
        flask_response.headers['Content-Security-Policy'] = "default-src 'none'; connect-src 'self'; font-src https://fonts.gstatic.com;img-src 'none'; object-src 'none'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"
        flask_response.headers['X-Frame-Options'] = 'none'
        flask_response.headers['Referrer-Policy'] = "no-referrer"
        flask_response.headers['Feature-Policy'] = "camera 'none'; fullscreen 'self'; geolocation 'none'; microphone 'none'"
        flask_response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
        flask_response.headers['X-XSS-Protection'] = '1; mode=block'
        flask_response.headers['X-Content-Type-Options'] = 'nosniff'
        if MUTE_SECURITY is None:
            flask_response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        return flask_response
    
    return K

def cookie_name():
    return '__Host-token' if MUTE_SECURITY is None else 'token'

def flask_answer_wrapper (f):
    def K(*args, **kwargs):
        token_session, authentication_request = [
            w.encode('ascii') if w is not None else None for w in (
                request.cookies.get(cookie_name()),
                request.headers.get('Authentication')
            )
        ]
        secure_token = get_secure(
            token_session,
            authentication_request
        )
        if secure_token is None:
            flask_response = flask_app.response_class(
                response = 'Forbidden access',
                status = 403,
                mimetype = 'application/json'
            )
        else:
            content = f(*args, **kwargs)
            flask_response = flask_app.response_class(
                response = content,
                status = 200,
                mimetype = 'application/json'
            )

        if secure_token is None:
            cookie_content = ''
            cookie_age = 0
        elif not secure_token == token_session:
            cookie_content = secure_token
            cookie_age = 8*60*60
        else:
            cookie_content = cookie_age = None

        if cookie_content is not None:
            flask_response.set_cookie(cookie_name(), cookie_content,
                    max_age = cookie_age,
                    secure = MUTE_SECURITY is None,
                    httponly = True,
                    path = '/',
                    domain = None,
                    samesite = 'Strict'
            )

        return flask_response
    return K

def with_enforced_https(f):
    def K(*args, **kwargs):
        if MUTE_SECURITY is None:
            if not request.is_secure:
                return redirect('https://family-calendar.herokuapp.com',
                    code = 301
                )
        return f(*args, **kwargs)
    return K

@with_enforced_https
@with_browser_security_enforced
def __main_page():
    html_content = render_template('index.htm',
               csrf_token = "MySecretToken",
               base_url = "http://localhost:5000" if (
                             MUTE_SECURITY is not None
                          ) else "https://family-calendar.herokuapp.com"
           )
    return flask_app.response_class(
            response = html_content,
            status = 200,
            mimetype = 'text/html'
    )

@with_enforced_https
@with_browser_security_enforced
@flask_answer_wrapper
def __send_event ():
    provided = request.json
    truncated = dumps(request.json) .encode('utf-8')[:512]
    if not provided == loads(truncated):
        raise Error("Invalid JSON Input, likely too long")
    time = insert_event (truncated)
    return dumps(time)

@with_enforced_https
@with_browser_security_enforced
@flask_answer_wrapper
def __fetch_events():
    time = request.args.get('from', type=int)

    def convert_event(data, timeTrack):
        return [loads(data.decode('utf-8')), timeTrack]
    
    return dumps([convert_event(*event) for event in get_from_date(time)])


###############################################################################
###################  MAIN PROCESS TRIGGERS FLASK RUN POINT   ##################

if __name__ == '__main__':
    flask_app.run()
