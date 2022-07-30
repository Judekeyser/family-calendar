<?php

require('remote_configs.php');

/* Print Secure headers */
{
    header("Content-Security-Policy: default-src 'none'; connect-src 'self'; font-src https://fonts.gstatic.com;img-src 'none'; object-src 'none'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'");
    header("X-Frame-Options: none");
    header("Referrer-Policy: no-referrer");
    header("Feature-Policy: camera 'none'; fullscreen 'self'; geolocation 'none'; microphone 'none'");
    header("X-Permitted-Cross-Domain-Policies: none");
    header("X-XSS-Protection: 1; mode=block");
    header("X-Content-Type-Options: nosniff");
    
    if(__SECURE) {
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
    }
}

/* Define CSRF token */
{
    $csrf_token = base64_encode(openssl_random_pseudo_bytes(32));
    setcookie(CSRF_COOKIE_NAME, $csrf_token, time()+CSRF_VALIDITY_DELAY, '/', '', __SECURE, true);
}

?>

<!DOCTYPE HTML>

<html lang="fr-be">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="assets/style.css" rel="stylesheet">

    <script src="assets/ArrayPolyfill.js"></script>
    <script src="assets/MyDate.js"></script>
    <script src="assets/NetworkMessage.js"></script>
    <script src="assets/GuiMessage.js"></script>
    <script src="assets/Event.js"></script>

    <title>Calendrier de famille</title>
  </head>
  <body>

    <nav>
      <form name="menuCtrl">
        <input type="range" name="rowCountSlider" value="4" min="1" max="9" step="1">
        <hr>
        <input type="date" name="directDateInput">
        <hr>
        <input type="button" id="menuCtrl_previousWeek" value="<">
        <input type="button" id="menuCtrl_nextWeek" value=">">
      </form>
      <hr>
      <table class="view-update" id="calendar_view_table">
        <colgroup>
          <col span="5">
          <col span="2">
        </colgroup>
        <thead>
          <tr>
            <th><abbr title="Lundi"    >Lun</abbr></th>
            <th><abbr title="Mardi"    >Mar</abbr></th>
            <th><abbr title="Mercredi" >Mer</abbr></th>
            <th><abbr title="Jeudi"    >Jeu</abbr></th>
            <th><abbr title="Vendredi" >Ven</abbr></th>
            <th><abbr title="Samedi"   >Sam</abbr></th>
            <th><abbr title="Dimanche" >Dim</abbr></th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </nav>

    <hr>

    <main>
      <dialog class="ask-user-appointment-details"><form method="dialog">
        <p>
          <label for="date">Date du rendez-vous:</label>
          <input type="date" id="date" name="date">
        </p>
        <p>
          <label for="time">Heure du rendez-vous:</label>
          <input type="time" id="time" name="time">
        </p>
        <p>
          <label for="shortTitle">Courte description</label>
          <input type="text" id="shortTitle" name="shortTitle" autocomplete="off">
        </p>
        <p class="right-align">
          <button value="confirm" id="details-btn-confirm">+</button>
          <button value="cancel">&#128473;</button>
        </p>
        <p id="cancelAppointmentArea">
          <input type="checkbox" name="cancelAppointmentMode" id="cancelAppointmentMode">
          <label for="cancelAppointmentMode">Annuler le rendez-vous</label>
        </p>
        <p class="out-of-flow"><input id="hidden-csrf-token" type="hidden" value="<?php echo $csrf_token;?>"></p>
      </form></dialog>
      <dialog class="ask-user-identification"><form method="dialog">
        <p>Identifiez-vous:</p>
        <p>
          <input type="radio" id="caroline" name="identifiant" value="caroline">
          <label for="caroline">Caroline</label>
          <br>
          <input type="radio" id="justin" name="identifiant" value="justin">
          <label for="justin">Justin</label>
        </p>
        <p class="right-align">
          <input type="button" class="okBtn not-confirm" value="Ok">
          <button value="confirm" class="confirmBtn confirm">Confirmer</button>
        </p>
      </form></dialog>
      
      
      
      <section>
        <header>
          <h1>Vue hebdomadaire</h1>
        </header>
        <dl id="content" class="view-update fetchEvents-result appointments"></dl>
      </section>
      <section id="news_section">
        <header>
          <h1>Encodages non lus</h1>
            <p>
                <button id="mark_as_read" class="quiet-button">Tout marquer comme lu</button>
            </p>
        </header>
        <dl id="news_content" class="view-update eventMap-updates appointments"></dl>
      </section>
    </main>

    <script src="assets/guiInitializer.js"></script>

  </body>
</html>
