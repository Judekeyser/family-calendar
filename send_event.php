<?php
require('configs.php');
function terminate_in_error($error_code, $error_message) {
  header('Content-Type: application/json');
  http_response_code($error_code);
  echo '"'.$error_message.'"';
  return false;
}

# If request is an initialization request, crafts a JS script. We are guaranteed to have a session containing the symbol
if(isset($_GET['init'])) {
  if(!session_start())
    return terminate_in_error(500, 'Impossible de démarrer une session sécurisée');
  $_csrf_token_1 = base64_encode(random_bytes(32));
  $_csrf_token_2 = base64_encode(random_bytes(32));
  header('Content-Type: text/javascript');
  setcookie(CSRF_COOKIE_NAME, $_csrf_token_1, time()+CSRF_VALIDITY_DELAY, '/', '', __SECURE, true);
  $_SESSION[CSRF_SESSION_NAME] = $_csrf_token_1 . $_csrf_token_2;
  echo 'window["__csrfToken"] = "' . $_csrf_token_2 . '";'; // comes back in CSRF_HEADER_NAME
  return;
} else {
  if(!session_start())
    return terminate_in_error(500, 'Impossible de démarrer une session sécurisée');
}

# Authentify request: CSRF symbol must be ok
if(  !isset($_SERVER[CSRF_HEADER_NAME])
  || !isset($_COOKIE[CSRF_COOKIE_NAME])
  || !isset($_SESSION[CSRF_SESSION_NAME])
  || !hash_equals($_SESSION[CSRF_SESSION_NAME], $_COOKIE[CSRF_COOKIE_NAME].$_SERVER[CSRF_HEADER_NAME])
) return terminate_in_error(403, 'Requête non certifiée');

$now = time() - mktime(
  0 /*hour*/, 0 /*minute*/, 0 /*second*/, 1 /*month*/, 1 /*day*/, 2021 /*year*/
);

# Authentify user
function erase_auth_cookie() {
  session_regenerate_id(true);
  setcookie(TOKEN_COOKIE_NAME, '', time()-42000, '/', '', __SECURE, true);
  return true;
}
if(isset($_SERVER[AUTH_HEADER])) {
  if($now - $_SESSION['last_trial_time'] < $_SESSION['password_trials'] * 2) {
    return terminate_in_error(429, 'Trop de requête, veuillez réessayer plus tard.');
  } else $_SESSION['last_trial_time'] = $now;
  if(password_verify($_SERVER[AUTH_HEADER], GLOBAL_PASSWORD)) {
    $_SESSION['password_trials'] = 0;
  } else {
    $_SESSION['password_trials'] += 1;
    header(AUTH_DELAY_HEADER.': '.($_SESSION['password_trials'] * 3));
    return terminate_in_error(401, 'Mot de passe non correct');
  }
} else {
  if(!isset($_COOKIE[TOKEN_COOKIE_NAME]))
    return erase_auth_cookie()
           && terminate_in_error(401, 'Token d\'accès non fourni, utilisateur non authentifié');
  if(substr_count($_COOKIE[TOKEN_COOKIE_NAME], '.') !== 2)
    return erase_auth_cookie()
           && terminate_in_error(403, 'Le token d\'accès est corrompu: trop de segments');

  [$_timestamp, $_rd, $_hash] = explode('.', $_COOKIE[TOKEN_COOKIE_NAME], 3);
  if(!is_numeric($_timestamp))
    return erase_auth_cookie()
           && terminate_in_error(403, 'Le token d\'accès est corrompu: timestamp n\'est pas numérique');
  if($_timestamp + TOKEN_LONG_VALIDITY_DELAY < $now)
    return erase_auth_cookie()
           && terminate_in_error(401, 'Le token d\'accès est expiré');
  if(!hash_equals(base64_encode(hash_hmac('sha256', "$_timestamp.$_rd", TOKEN_INTERNAL_HASH_SALT, true)), $_hash))
    return erase_auth_cookie()
           && terminate_in_error(401, 'Le token d\'accès est corrompu: signature invalide');
   
  if($_timestamp + TOKEN_SHORT_VALIDITY_DELAY >= $now)
    $access_token = $_COOKIE[TOKEN_COOKIE_NAME];
}
if(!isset($access_token)) {
  $_rd = base64_encode(random_bytes(32));
  $_hash = base64_encode(hash_hmac('sha256', "$now.$_rd", TOKEN_INTERNAL_HASH_SALT, true));
  $access_token = "$now.$_rd.$_hash";
}
setcookie(TOKEN_COOKIE_NAME, $access_token, time()+TOKEN_LONG_VALIDITY_DELAY, '/', '', __SECURE, true);

# Validate inputs (parameter in query string, and file content) and request result
if(!isset($_GET['from']) || !is_numeric(($from_time = $_GET['from'])))
  return terminate_in_error(400, 'Paramètre de requête non renseigné ou incorrect (doit être numérique)');

if($_SERVER['REQUEST_METHOD'] === 'POST') {
  if(  !isset($_SERVER['CONTENT_TYPE'])
    || $_SERVER['CONTENT_TYPE'] !== 'application/json'
  ) return terminate_in_error(400, 'Type de contenu de la requête n\'est pas renseignée comme JSON');
  $_file_content = file_get_contents('php://input', false, null, 0, 1024);
  if(false === $_file_content
    || !mb_check_encoding($_file_content, 'UTF-8')
    || is_null(json_decode($_file_content, null, 3, 0))
  ) return terminate_in_error(400, 'Les données transmises sont corrompues');
  $data = base64_encode($_file_content);
}

#Connect the database
try {
  $_con = new mysqli(DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME);
  if(!is_null($_con -> connect_error))
    return terminate_in_error(500, 'Impossible de joindre la base de données');
  if(isset($data)) {
    if(false === ($_stmt = $_con -> prepare("
        insert into EVENT
        (_nbr_send_event, _data) values (?, ?)"))
    ) return terminate_in_error(500, 'Impossible de préparer la requête d\'insertion de rendez-vous');
    else try {
      if(  !$_stmt -> bind_param('ss', $now, $data) 
        || !$_stmt -> execute()
      ) return terminate_in_error(500, 'Impossible d\'exécuter la requête d\'insertion de rendez-vous');
    } finally { $_stmt -> close(); }
  }
  if(false === ($_stmt = $_con -> prepare("
        select _nbr_send_event, _data
        from EVENT where _nbr_send_event > ?
        order by _nbr_send_event limit 150 "))
  ) return terminate_in_error(500, 'Impossible de préparer la requête de sélection de rendez-vous');
  else try {
    if(  !$_stmt -> bind_param('s', $from_time)
      || !$_stmt -> execute()
      || !$_stmt -> bind_result($_event_number, $_event_data)
      || !$_stmt -> store_result()
    ) return terminate_in_error(500, 'Impossible d\'exécuter la requête de sélection de rendez-vous');
    try {
      $events = [];
      for($i = $_stmt -> num_rows; $i > 0; $i--)
        if(!$_stmt -> fetch())
          return terminate_in_error(500, 'Erreur lors de la récupération des évenements');
        else $events[] = [base64_decode($_event_data, false), $_event_number];
    } finally { $_stmt -> free_result(); }
  } finally { $_stmt -> close(); }
} finally { $_con -> close(); }

# Print on page
header("Content-Type: application/json");
if(($last_event = end($events)) !== false) {
  header('X-Next-Page-Time: '.$last_event[1]);
}
echo '[';
foreach($events as [$event_data, $event_time])
  echo "[$event_data,$event_time],";
echo 'null]';
?>