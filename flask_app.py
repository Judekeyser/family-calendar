from flask       import Flask, g, request
from json        import dumps, loads

import db_bridge
import secure_bridge


###############################################################################
####################  ENVIRONMENT CONFIGURATION VARIABLES  ####################

import os
DATABASE_URL              = os.environ.get('DATABASE_URL')
ENCRYPTION_KEY_SECRET     = os.environ.get('ENCRYPTION_KEY_SECRET')
HASH_KEY_SECRET           = os.environ.get('HASH_KEY_SECRET')
AUTHENTICATION_KEY_SECRET = os.environ.get('AUTHENTICATION_KEY_SECRET')
PASSWORD                  = os.environ.get('PASSWORD')


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

    token = secure_bridge.auth_strategy(binary_token, 30, 90,
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

def flask_answer_wrapper (f):
    def K(*args, **kwargs):
        token_session, authentication_request = [
            w.encode('ascii') if w is not None else None for w in (
                request.cookies.get('token'),
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
            cookie_age = 60
        else:
            cookie_content = cookie_age = None

        if cookie_content is not None:
            flask_response.set_cookie('token', cookie_content,
                    max_age = cookie_age,
                    secure = True,
                    httponly = True
            )

        return flask_response
    return K

@flask_answer_wrapper
def __send_event ():
    provided = request.json
    truncated = dumps(request.json) .encode('utf-8')[:512]
    if not provided == loads(truncated):
        raise Error("Invalid JSON Input, likely too long")
    time = insert_event (truncated)
    return dumps(time)

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
