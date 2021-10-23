function Event ({ strDate, strTime, strDescription, kind }) {
	this.date = MyDate.fromFormattedString(strDate);
	this.time = strTime;
	this.description = strDescription;
	this.kind = kind;
}

Event.prototype = {	
	print: function(printer) {
		var strDate = this.date.asFormattedString(),
		    strTime = this.time,
		    strDescription = this.description,
		    kind = this.kind;

		printer (JSON.stringify({
			strDate,
			strTime,
			strDescription,
			version: 1,
			kind
		}));
	},
	getKind: function() {
		return this.kind;
	},
	dateKey: function() {
		return this.date.asFormattedString();
	},
	perDayProjection: function() {
		return {
			time: this.time,
			description: this.description,
			kind: this.kind
		};
	},
	send: function() {
		var messageData = {
			method: "POST",
			url: "send_event"
		}
		this.print(_ => (messageData.data = _));
		return new NetworkMessage(messageData)
			.send()
			.then(() => this.muteSend());
	},

	muteSend: function() {
		this. send = function() {
			throw "Mute of send has been called on this event: impossible to send it again";
		}
	}
};

Event.read = function (data) {
	if (! data)
		return null;
	var { version } = data;
	if (version == 1) {
		var event = new Event (data);
		event .muteSend();
		return event;
	} else return null;
};

(function() {
	var lastTrackTime = 0,
	    eventsStorage = {};

	window.addEventListener ("fetchEvents", () => {
		const contentHandler = content => {
			var records = JSON.parse (content)
							.map(([data, timeTrack]) => ([Event.read(data), timeTrack]))
							.filter(([_1]) => !!_1)
							.sortedBy (([_1, _2]) => _2);

			lastTrackTime = records.isNotEmpty()
								? records.map(([_1, timeTrack]) => timeTrack).last()
								: lastTrackTime;
			
			records.map (([event, _2]) => event)
				.forEach(event => {
					var dateKey = event.dateKey();
					if (! eventsStorage[dateKey])
						eventsStorage[dateKey] = [];
					eventsStorage[dateKey].push(event);
				});

			[...document.querySelectorAll(".fetchEvents-result")]
			.forEach(elem => elem.dispatchEvent(new CustomEvent("fetchEvents-result", { detail: eventsStorage })));
		};

		new NetworkMessage({
			method: "GET",
			url: `fetch_events?from=${lastTrackTime}`
		}).send()
		.then(({ content }) => contentHandler(content));

	});

})();
