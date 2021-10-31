function NetworkMessage({ method, url, data }) {
	this.method = method;
	this.url = url;
	this.data = data;
}

NetworkMessage.prototype = {
	commit: function() {
		return new Promise((resolve, reject) => {
			var req = new XMLHttpRequest();
			req.onreadystatechange = () => {
				if (req.readyState == 4) {
					if (req.status == 200)
						resolve({ content: req.response });
					else if (req.status == 401)
						resolve({ unauth: true });
					else if (req.status == 403) {
						alert("L'accès est interdit,\nce qui peut signifier une session corrompue.\nLe plus simple est de recharger la page.");
						reject();
					} else reject();
				}
			};
			req.onerror = () => reject();

			req.open(this.method, `${NetworkMessage.baseUrl}${this.url}`);
			if(this.password)
				req.setRequestHeader('Authentication', this.password);
			req.setRequestHeader('X-Csrf-Token', NetworkMessage.csrfToken);
			req.setRequestHeader('Accept', 'application/json');
			if (this.method == 'POST') {
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(this.data);
			} else {
				req.send();
			}
		});
	},

	password: undefined,

	askForUserCredentials: function() {
		return Promise.resolve(prompt("Déverrouiller le calendrier"));
	},

	send: function() {
		return this.commit()
		   .catch(() => new Promise((resolve, reject) => {
		   	alert("Une erreur inattendue semble s'être produite.\nUne nouvelle tentative sera lancée dans quelques secondes...");
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
