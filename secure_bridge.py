from base64               import urlsafe_b64encode as encode_to_base64,\
                                 urlsafe_b64decode as decode_from_base64,\
                                 b64encode         as std_base64_encode,\
                                 b64decode         as std_base64_decode
from cryptography.fernet  import Fernet
from datetime             import datetime, timezone
from hashlib              import sha256, sha512
from uuid                 import uuid4


###############################################################################
####################  TOKEN COMPOSITION AND DECOMPOSITON  #####################

def _hash (binary_string, salt_key=None):
  digester = sha512()
  digester .update (binary_string)
  digester .update (salt_key)
  return digester .digest()

def _encrypt (binary_string, key=None):
  return Fernet(key) .encrypt(binary_string)

def _decrypt (binary_string, key=None):
  return Fernet(key) .decrypt(binary_string)

def _merge (*binary_string_s):
  return b'.'.join((encode_to_base64(w) for w in binary_string_s))

def _split (binary_string):
  return [decode_from_base64(w) for w in binary_string.split(b'.')]

def _create_token (*binary_string_s, encrypt_key=None, hash_key=None):
  merged = _merge(*binary_string_s)
  merged = _merge(merged, _hash(merged, salt_key=hash_key))
  return encode_to_base64(_encrypt(merged, key=encrypt_key))


###############################################################################
##########################  INFORMATION GENERATIONS  ##########################

def ascii_encode (f):
    def k(*args, **kwargs):
        return str(f(*args, **kwargs)) .encode('ascii')
    return k

@ascii_encode
def now():
    now_time = datetime.now(timezone.utc)
    reference = datetime(2021, 1, 1, 0, 0, 0, 0, timezone.utc)
    return int((now_time - reference) .total_seconds())

@ascii_encode
def random_word():
    return uuid4()

def information():
    return (now(), random_word())

def _assert_validity (token, maximal_time_shifts, encrypt_key=None, hash_key=None):
    decoded = _decrypt(decode_from_base64(token), key=encrypt_key)
    merged, hashed_merged = _split(decoded)
    if not _hash(merged, salt_key=hash_key) == hashed_merged:
        raise ValueError("Hash of content does not match: corrupted token")
    test_time, _ = _split(merged)
    
    def validate_information(maximal_time_shift):
        return int(now()) - int(test_time) <= maximal_time_shift
    
    return (validate_information(t) for t in maximal_time_shifts)


###############################################################################
##############  AUTHENTICATION STRATEGY VIA TOKEN WITH RECOVER  ###############

def _authentify_credentials (hashed_expected, credentials, auth_key):
    if credentials is None:
        return False
    got = std_base64_encode(_hash(credentials, salt_key=auth_key))
    return got == hashed_expected

def _auth_strategy(provided_token, max_age, max_refresh_age, credentials,
    enc_key, hash_key, auth_key, hashed_password
):
    has_not_expired = any_failure_flag = False

    if provided_token is not None:
        try:
            is_valid, has_not_expired = _assert_validity(
                provided_token, (
                    max_age,
                    max_refresh_age
                ), encrypt_key=enc_key, hash_key=hash_key
            )
            if is_valid:
                return provided_token
        except:
            any_failure_flag = True

    binary_string_s = information()
    return _create_token(*binary_string_s, encrypt_key=enc_key, hash_key=hash_key) if (
        not any_failure_flag and (
            has_not_expired or _authentify_credentials(
                hashed_password, credentials, auth_key
            )
        )
    ) else None


class AuthentifierConfig:
    def __init__(self, encrypt_key=None, hash_key=None, auth_key=None, password=None, max_age_hrs=None, max_refresh_age_hrs=None, csrf_cookie_name=None, auth_cookie_name=None):
        self.encrypt_key = encrypt_key
        self.hash_key = hash_key
        self.auth_key = auth_key
        self.password = password
        self.max_age_hrs = max_age_hrs
        self.max_refresh_age_hrs = max_refresh_age_hrs
        self.auth_cookie_name = auth_cookie_name
        self.csrf_cookie_name = csrf_cookie_name
    
    def authentication_strategy(self, provided_token, provided_credentials):
        return _auth_strategy(provided_token,
            self.max_age_hrs * 3600, self.max_refresh_age_hrs * 3600,
            provided_credentials,
            self.encrypt_key, self.hash_key, self.auth_key, self.password
        )


class Authentifier:
    def __init__(self,
        token_session=None,
        credentials=None,
        csrf_cookie=None,
        csrf_header=None,
        config=None
    ):
        self.csrf_cookie = csrf_cookie
        self.csrf_header = csrf_header
        self.config = config
        
        token_session, credentials = [
          w.encode('ascii') if w is not None else None for w in (
            token_session, credentials
          )
        ]

        token = config.authentication_strategy(token_session,credentials)
        if token is not None:
            self.secure_token = token.decode('ascii')
        else:
            self.secure_token = None

    def reset_csrf_token (self):
        self.csrf_cookie = None
        self.csrf_header = random_word().decode('ascii')
        return self.csrf_header

    def validates_request (self):
        return self.csrf_cookie is not None and \
               self.csrf_cookie == self.csrf_header

    def authentifies_user (self):
        return self.secure_token is not None

    def alters_cookies (self, c_consumer):
        if not self .authentifies_user():
            c_consumer(self.config.auth_cookie_name, '', 0)
        else:
            c_consumer(self.config.auth_cookie_name, self.secure_token, (self.config.max_refresh_age_hrs - 1)*3600)
        if not self .validates_request() and self.csrf_header is not None:
            c_consumer(self.config.csrf_cookie_name, self.csrf_header, self.config.max_refresh_age_hrs*3600)


###############################################################################
##############  MAIN ENTRY POINT GENERATES SECURED RANDOM KEY  ################

if __name__ == '__main__':
    try:
      with open ('/dev/urandom', 'rb') as random_generator:
        hash_key = encode_to_base64(random_generator .read(32))
        encryption_key = encode_to_base64(random_generator .read(32))
        auth_key = encode_to_base64(random_generator .read(32))
    except:
      print("Likely couldn't open /dev/urandom: Windows platform?")
      hash_key = encode_to_base64(b'12345678901234567890123456789012')
      encryption_key = encode_to_base64(b'12345678901234567890123456789000')
      auth_key = encode_to_base64(b'12345678901234567890123456789021')
    
    info_now, info_word = information()

    print("Generated information is: { now: %s, word: %s }" % (info_now, info_word))

    token = _create_token(info_now, info_word, encrypt_key=encryption_key, hash_key=hash_key)
    print("Generated token is: %s" % token)

    print("-------------------------")
    user_challenge = std_base64_encode(input("Enter a password candidate:").encode('ascii'))
    password = std_base64_encode(_hash(user_challenge, salt_key=auth_key))
    print("User challenge is %s" % user_challenge)
    print("-------------------------")

    import time
    time.sleep(2)

    print("HASH_KEY_SECRET='%s'" % hash_key .decode('ascii'))
    print("ENCRYPTION_KEY_SECRET='%s'" % encryption_key .decode('ascii'))
    print("AUTHENTICATION_KEY_SECRET='%s'" % auth_key .decode('ascii'))
    print("PASSWORD='%s'" % password .decode('ascii'))

    print("-------------------------")

    print("Trying to validate no token with no credentials should fail")
    test = _auth_strategy(None, 5, 7, None, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate no token with wrong credentials should fail")
    test = _auth_strategy(None, 5, 7, 'Anything'.encode('ascii'), encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate wrong token should fail")
    test = _auth_strategy(_create_token(info_now, info_word, encrypt_key=auth_key, hash_key=hash_key), 5, 7, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate wrong token should fail")
    test = _auth_strategy(_create_token(info_now, info_word, encrypt_key=auth_key, hash_key=hash_key), 5, 7, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate old token should fail")
    test = _auth_strategy(token, 0, 0, None, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate an old token with credentials should regen a token")
    test = _auth_strategy(token, 0, 0, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate not so old token should regen a token")
    test = _auth_strategy(token, 0, 8, None, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate a valid token should render the same token")
    test = _auth_strategy(token, 10, 20, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)
    if not test == token:
        raise(Exception("This test failed..."))
