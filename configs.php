<?php

if(session_status() == PHP_SESSION_DISABLED)
    return terminate_in_error(500, "Erreur de configuration: sessions désactivées");

define('DATABASE_HOST', 'host.docker.internal');
define('DATABASE_USER', 'root');
define('DATABASE_PASSWORD', 'kostas');
define('DATABASE_NAME', 'familycalendar');

define('TOKEN_LONG_VALIDITY_DELAY', 2*24*60*60);
define('TOKEN_SHORT_VALIDITY_DELAY', 1*60*60);
define('CSRF_VALIDITY_DELAY', 20*60);

define('TOKEN_INTERNAL_HASH_SALT', 'JDJ5JDExJENxNU9KYU00Z1R0d1ZDWUVRTHhKSy5LMGdoNE9xTFlmRFpFaS5uaUdkTXZodlA4dUdqQ3FX');

define('GLOBAL_PASSWORD', '$argon2id$v=19$m=65536,t=4,p=1$US4wY2RDS05aMTdIS3hhWg$OzlyS7MzYUzuUJkucSRMtOcqdGjavPb7KY4wEilnims');

define('__SECURE', False);

define('AUTH_HEADER', 'HTTP_AUTHENTICATION');
define('AUTH_DELAY_HEADER', 'X-Authentication-Delay');
define('CSRF_HEADER_NAME', 'HTTP_X_CSRF_TOKEN');
define('CSRF_SESSION_NAME', 'csrf_symbol');
if(__SECURE) {
    define('CSRF_COOKIE_NAME', '__Host-csrftoken');
    define('TOKEN_COOKIE_NAME', '__Host-accesstoken');
} else {
    define('CSRF_COOKIE_NAME', 'csrftoken');
    define('TOKEN_COOKIE_NAME', 'accesstoken');
}
?>
