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

def hash (binary_string, secret_key):
  digester = sha512()
  digester .update (binary_string)
  digester .update (secret_key)
  return digester .digest()

def encrypt (binary_string, key):
  return Fernet(key) .encrypt(binary_string)

def decrypt (binary_string, key):
  return Fernet(key) .decrypt(binary_string)

def merge (seq):
  return b'.'.join([encode_to_base64(w) for w in seq])

def split (binary_string):
  return [decode_from_base64(w) for w in binary_string.split(b'.')]

def create_token (information, encrypt_key, hash_key):
  merged = merge(information)
  merged = merge ((merged, hash(merged, hash_key)))
  return encode_to_base64(encrypt(merged, encrypt_key))

def assert_validity (token, encrypt_key, hash_key,maximal_time_shifts):
    decoded = decrypt(decode_from_base64(token), encrypt_key)
    merged, hashed_merged = split(decoded)
    if not hash(merged, hash_key) == hashed_merged:
        raise Exception("Hash of content does not match: corrupted token")
    challenge = split(merged) 
    return (validate_information (challenge, t) for t in maximal_time_shifts)


###############################################################################
##########################  INFORMATION GENERATIONS  ##########################

def ascii_encode (f):
    def k(*args, **kwargs):
        return str(f(*args, **kwargs)) .encode('ascii')
    return k

@ascii_encode
def now():
    def to_seconds (now_time):
        reference = datetime(2021, 1, 1, 0, 0, 0, 0, timezone.utc)
        return int((now_time - reference) .total_seconds())

    return to_seconds(datetime.now(timezone.utc))

@ascii_encode
def random_word():
    return uuid4()

def information():
    return (now(), random_word())

def validate_information(test, maximal_time_shift):
    test_time, _ = test
    if int(now()) - int(test_time) > maximal_time_shift:
        return False 
    return True


###############################################################################
##############  AUTHENTICATION STRATEGY VIA TOKEN WITH RECOVER  ###############

def authentify_credentials (hashed_expected, credentials, auth_key):
    if credentials is None:
        return False
    got = std_base64_encode(hash(credentials, auth_key))
    return got == hashed_expected

def auth_strategy(provided_token, max_age, max_refresh_age, auth_recover,
    enc_key, hash_key, auth_key, hashed_password
):
    has_not_expired = any_failure_flag = False

    if provided_token is not None:
        try:
            is_valid, has_not_expired = assert_validity(
                provided_token, enc_key, hash_key, (
                    max_age,
                    max_refresh_age
                )
            )
            if is_valid:
                return provided_token
        except:
            any_failure_flag = True

    return create_token(information(), enc_key, hash_key) if (
        not any_failure_flag and (
            has_not_expired or authentify_credentials(
                hashed_password, auth_recover, auth_key
            )
        )
    ) else None


###############################################################################
##############  MAIN ENTRY POINT GENERATES SECURED RANDOM KEY  ################

if __name__ == '__main__':
    with open ('/dev/urandom', 'rb') as random_generator:
        hash_key = encode_to_base64(random_generator .read(32))
        encryption_key = encode_to_base64(random_generator .read(32))
        auth_key = encode_to_base64(random_generator .read(32))
    
    info = information()
    info_now, info_word = info

    print("Generated information is: { now: %s, word: %s }" % (info_now, info_word))

    token = create_token(info, encryption_key, hash_key)
    print("Generated token is: %s" % token)

    print("-------------------------")
    user_challenge = std_base64_encode(input("Enter a password candidate:").encode('ascii'))
    password = std_base64_encode(hash(user_challenge, auth_key))
    print("User challenge is %s" % user_challenge)
    print("-------------------------")

    import time
    time.sleep(2)
    recomputed = assert_validity(token, encryption_key, hash_key, [1,5])
    print([t for t in recomputed])

    print("HASH_KEY_SECRET='%s'" % hash_key .decode('ascii'))
    print("ENCRYPTION_KEY_SECRET='%s'" % encryption_key .decode('ascii'))
    print("AUTHENTICATION_KEY_SECRET='%s'" % auth_key .decode('ascii'))
    print("PASSWORD='%s'" % password .decode('ascii'))

    print("-------------------------")

    print("Trying to validate no token with no credentials should fail")
    test = auth_strategy(None, 5, 7, None, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate no token with wrong credentials should fail")
    test = auth_strategy(None, 5, 7, 'Anything'.encode('ascii'), encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate wrong token should fail")
    test = auth_strategy(create_token(info, auth_key, hash_key), 5, 7, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate wrong token should fail")
    test = auth_strategy(create_token(info, auth_key, hash_key), 5, 7, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate old token should fail")
    test = auth_strategy(token, 0, 0, None, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate an old token with credentials should regen a token")
    test = auth_strategy(token, 0, 0, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate not so old token should regen a token")
    test = auth_strategy(token, 0, 8, None, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)

    print("Trying to validate a valid token should render the same token")
    test = auth_strategy(token, 10, 20, user_challenge, encryption_key, hash_key, auth_key, password)
    print("\t|%s|" % test)
    if not test == token:
        raise("This test failed...")
