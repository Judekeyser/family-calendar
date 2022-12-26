<?php
define('DATABASE_HOST', 'localhost');
define('DATABASE_USER', 'root');
define('DATABASE_PASSWORD', 'kostas');
define('DATABASE_NAME', 'familycalendar');

define('TOKEN_LONG_VALIDITY_DELAY', 2*24*60*60);
define('TOKEN_SHORT_VALIDITY_DELAY', 1*60*60);
define('CSRF_VALIDITY_DELAY', 20*60);
define('TOKEN_INTERNAL_HASH_SALT', 'JDJ5JDExJENxNU9KYU00Z1R0d1ZDWUVRTHhKSy5LMGdoNE9xTFlmRFpFaS5uaUdkTXZodlA4dUdqQ3FX');

define('GLOBAL_PASSWORD', '$2y$14$A6EMIXsvYlJIiEilezCM5.JE77ZCYU9ohebHhJdQToh4Et8glhdTi');

define('__SECURE', False);

define('AUTH_HEADER', 'HTTP_AUTHENTICATION');
define('CSRF_HEADER_NAME', 'HTTP_X_CSRF_TOKEN');
if(__SECURE) {
    define('CSRF_COOKIE_NAME', '__Host-csrftoken');
    define('TOKEN_COOKIE_NAME', '__Host-accesstoken');
} else {
    define('CSRF_COOKIE_NAME', 'csrftoken');
    define('TOKEN_COOKIE_NAME', 'accesstoken');
}
?>