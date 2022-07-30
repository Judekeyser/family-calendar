<?php

require('remote_configs.php');

function now() {
    return time() - mktime(0 /*hour*/, 0 /*minute*/, 0 /*second*/, 1 /*month*/, 1 /* day */, 2021 /* year */);
}

function sha256($string) {
    return base64_encode(openssl_digest($string.TOKEN_INTERNAL_HASH_SALT, 'sha256', true));
}

function new_access_token() {
    $now = now();
    $randomisation = base64_encode(openssl_random_pseudo_bytes(32));
    
    $aggregated = "$now.$randomisation.";
    $hashed = sha256($aggregated);
    $token = $aggregated.$hashed;
    
    return $token;
}

function get_valid_token($challenge) {
    if(strlen($challenge) > TOKEN_MAX_LENGTH) return false;
    $components_count = substr_count($challenge, '.');
    if($components_count !== 2) return false;
    $components = explode('.', $challenge, 3);
    
    $challenge_timestamp = $components[0];
    $challenge_randomisation = $components[1];
    $hashed = $components[2];
    
    $now = now();
    
    $is_format_valid = (
        is_numeric($challenge_timestamp)
    ) && (
        $challenge_timestamp + TOKEN_LONG_VALIDITY_DELAY >= $now
    ) && (
        hash_equals(sha256("$challenge_timestamp.$challenge_randomisation."), $hashed)
    );
    
    if(! $is_format_valid) {
        return false;
    } else if ($challenge_timestamp + TOKEN_LONG_VALIDITY_DELAY < $now) {
        return false;
    } else if($challenge_timestamp + TOKEN_SHORT_VALIDITY_DELAY < $now) {
        return new_access_token();
    } else {
        return $challenge;
    }
}

function get_events($connection, $from_time) {    
    $select_statement = <<<QUERY
select _nbr_send_event, _data
  from EVENT where _nbr_send_event > ?
  order by _nbr_send_event limit 50
QUERY;
    
    $is_ok = (
        ($statement = $connection -> prepare($select_statement)) !== false
    ) && (
        $statement -> bind_param('s', $from_time)
    ) && (
        $statement -> execute()
    ) && (
        ($events = $statement -> get_result()) !== false
    ) && (
        $statement -> error == null
    );

    if (! $is_ok) {
        return false;
    }
    
    return $events;
}

function push_event($connection, $time, $data) {
    $select_statement = <<<QUERY
insert into EVENT
(_nbr_send_event, _data) values (?, ?)
QUERY;
    
    $is_ok = (
        ($statement = $connection -> prepare($select_statement)) !== false
    ) && (
        $statement -> bind_param('ss', $time, $data)
    ) && (
        $statement -> execute()
    ) && (
        $statement -> error == null
    );

    return $is_ok;
}

function terminate_in_error($error_code, $error_message) {
    header('Content-Type: text/plain');
    http_response_code($error_code);
    echo $error_message;
    return false;
}

/*
Cross-check CSRF token
*/
{
    if(! isset($_SERVER['HTTP_X_CSRF_TOKEN']) || ! isset($_COOKIE[CSRF_COOKIE_NAME])) {
        return terminate_in_error(403, 'Untrusted request does not contain symbol');
    }
    $header_csrf_token = $_SERVER['HTTP_X_CSRF_TOKEN'];
    $cookie_csrf_token = $_COOKIE[CSRF_COOKIE_NAME];
    
    $is_ok = (
        ($header_csrf_token = base64_decode($header_csrf_token, true)) !== false
    ) && (
        ($cookie_csrf_token = base64_decode($cookie_csrf_token, true)) !== false
    ) && (
        hash_equals($header_csrf_token, $cookie_csrf_token)
    );
    
    if(! $is_ok) {
        return terminate_in_error(403, 'Untrusted request from user');
    }
}

/* Check if password is provided,
in which case we verify the csrf token contained in cookie and X-Csrf-Token header.
post-condition: Upon valid authentication, $access_token is set to a valid access token.
*/ {
    if(isset($_SERVER['HTTP_AUTHENTICATION'])) {
        $authentication = $_SERVER['HTTP_AUTHENTICATION'];
        
        $is_ok = (
            ($authentication = base64_decode($authentication, true)) !== false
        ) && (
            mb_check_encoding($authentication, 'UTF-8')
        );
        
        if(! $is_ok) {
            return terminate_in_error(403, 'Malformed authentication field');
        } else if (! password_verify($authentication, GLOBAL_PASSWORD)) {
            return terminate_in_error(401, 'Password mismatch');
        }
    }
}

/* Check access token
post-condition: $access_token contains a valid access token
*/
{
    if(isset($_SERVER['HTTP_AUTHENTICATION'])) {
        $access_token = new_access_token();
    } else {
        if(! isset($_COOKIE[TOKEN_COOKIE_NAME])) {
            return terminate_in_error(401, 'Unable to acquire access token');
        }
        $access_token = get_valid_token($_COOKIE[TOKEN_COOKIE_NAME]);
        if($access_token === false) {
            return terminate_in_error(401, 'Invalid access token, authentication required');
        }
    }
}

/* Check FROM query parameter
post-condition: A variable $from exists and contains the
                bound for event fetching.

*/
{
    $is_ok = (
        isset($_GET['from'])
    ) && (
        is_numeric($from = $_GET['from'])
    );
    
    if(! $is_ok) {
        return terminate_in_error(400, 'From query parameter unset');
    }
}

/* Check DATA to push
post-condition: A variable $data is either null (no data),
                or else contains a base64 representation of the JSON to push.
*/
{
    if($_SERVER['REQUEST_METHOD'] === 'POST') {
        $is_ok = (
            ($data = file_get_contents('php://input', false, null, 0, 1024)) !== false
        ) && (
            mb_check_encoding($data, 'UTF-8')
        ) && (
            json_decode($data, null, 2, 0) != null
        );

        if(! $is_ok) {
            return terminate_in_error(400, 'Provided data is not ok');
        }
        $data = mb_convert_encoding($data, 'BASE64', 'UTF-8');
    } else {
        $data = null;
    }
}

/*
Execute event sending, and print result on page
*/
{
    header("Content-Type: application/json");
    setcookie(TOKEN_COOKIE_NAME, $access_token, time()+TOKEN_LONG_VALIDITY_DELAY, '/', '', __SECURE, true);
    
    try {
        $connection = new mysqli(DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME);
        if($connection -> connect_error != null) {
            echo $connection -> connect_error;
            return terminate_in_error(500, 'Unable to acquire database connection');
        }
        $is_ok = (
            $data == null || push_event($connection, now(), $data)
        ) && (
            ($events = get_events($connection, $from)) !== false
        );
        
        if(! $is_ok) {
            return terminate_in_error(500, 'Failed to execute query');
        }
    } finally {
        $connection -> close();
    }
    
    echo '[';
    foreach($events as $event) {
        $nbr_send_event = $event['_nbr_send_event'];
        $data = $event['_data'];
        
        $data = mb_convert_encoding($data, 'UTF-8', 'BASE64') or '{}';
        
        echo "[$data, $nbr_send_event],";
    }
    echo 'null]';
}

?>