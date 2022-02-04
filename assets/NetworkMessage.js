function NetworkMessage({ method, url, data }) {
  this.method = method;
  this.url = url;
  this.data = data;
}

async function getCsrfToken() {
  for(let i = 0; i < 5; i++) {
    var element = window["hidden-csrf-token"];
    if(!element) {
      await new Promise(r => setTimeout(() => r(), 200));
    } else {
      return element;
    }
  }
  throw "Une erreur s'est produite: le contenu est trop lent à charger";
}

NetworkMessage.prototype = {
  commit: function() {
    return getCsrfToken().then(csrfToken => new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();
      req.onreadystatechange = () => {
        if (req.readyState == 4) {
          if (req.status == 200)
            resolve({ content: req.response });
          else if (req.status == 401)
            resolve({ unauth: true });
          else if (req.status == 403) {
            alert();
            reject("L'accès est interdit,\nce qui peut signifier une session corrompue.\nLe plus simple est de recharger la page.");
          } else reject("Une erreur inattendue s'est produite: côté serveur?");
        }
      };
      req.onerror = () => reject("Une erreur inattendue s'est produite: perte de connection internet?");

      req.open(this.method, `/${this.url}`);
      if(this.password)
        req.setRequestHeader('Authentication', this.password);
      req.setRequestHeader('X-Csrf-Token', csrfToken);
      req.setRequestHeader('Accept', 'application/json');
      if (this.method == 'POST') {
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(this.data);
      } else {
        req.send();
      }
    }));
  },

  password: undefined,

  askForUserCredentials: function() {
    return Promise.resolve(prompt("Déverrouiller le calendrier"));
  },

  send: function() {
    return this.commit()
       .catch(err => new Promise((resolve, reject) => {
         alert(err);
         setTimeout(() => {
           resolve (this.commit());
         }, 4000);
       }))
       .then(({ unauth, content }) => {
         return unauth
           ? this.askForUserCredentials()
          .then(maybePassword => {
            if (! maybePassword)
              throw "Le mot de passe n'a pas été fourni";
            this.password = btoa(maybePassword);
            return this.send();
          })
               : ({ content });
       });
  }
}
