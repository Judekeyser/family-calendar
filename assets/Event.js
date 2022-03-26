function Event ({ strDate, strTime, strDescription, kind, userInitiator }) {
  this.date = MyDate.fromFormattedString(strDate);
  this.time = strTime;
  this.description = strDescription;
  this.kind = kind;
  this.userInitiator = userInitiator;
}

Event.prototype = {  
  print: function(printer) {
    var strDate = this.date.asFormattedString(),
        strTime = this.time,
        strDescription = this.description,
        kind = this.kind,
        userInitiator = this.userInitiator;

    printer (JSON.stringify({
      strDate,
      strTime,
      strDescription,
      version: 1,
      kind,
      userInitiator
    }));
  },
  getKind: function() {
    return this.kind;
  },
  getUserInitiator: function() {
    return this.userInitiator;
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
    };
    if (! this.userInitiator) {
        var userFromStorage = window.localStorage.getItem('userName');
        this.userInitiator = userFromStorage;
    }
    this.print(_ => (messageData.data = _));
    return new NetworkMessage(messageData)
      .send()
      .then(() => this.muteSend());
  },

  muteSend: function() {
    this.send = function() {
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
  var lastHookFetch = null,
      eventsStorage = {
          /*
          Mapping date -> hour -> Event
          */
      };

  var tracker = (function() {
    var trackTime = 0,
        fetchTime = 0;

    return {
      set trackTime(t) {
        if(t)
          trackTime = t;
      },
      hasNotFetchedForLong: function() {
        return Date.now() - fetchTime > 3000;
      },
      hasFetchedRecently: function() {
        return Date.now() - fetchTime < 1000;
      },
      fetchNow: function() {
        fetchTime = Date.now();
        new NetworkMessage({
          method: "GET",
          url: `fetch_events?from=${trackTime}`
        }).send()
        .then(({ content }) => contentHandler(content))
        .then(isEmpty => isEmpty ? terminateReading() : this.fetchNow());
      }
    };
  })();

  function contentHandler (content) {
    var records = JSON.parse (content)
        .map(([data, timeTrack]) => ([Event.read(data), timeTrack]))
        .filter(([_1]) => !!_1)
        .sortedBy (([_1, timeTrack]) => timeTrack);

    tracker.trackTime = records.isNotEmpty()
          ? records.last()[1]
          : undefined;
    
    records.forEach(([event, timetrack]) => {
        var dateKey = event.dateKey();
        if (! eventsStorage[dateKey])
          eventsStorage[dateKey] = {};
        if(event.kind == 'cancel') {
            if (eventsStorage[dateKey][event.time]) {
                delete eventsStorage[dateKey][event.time];
            }
        } else if (event.kind == 'create') {
            eventsStorage[dateKey][event.time] = event;
        }
    });
    
    return records.isEmpty();
  }
  
  function terminateReading() {
      sendToUIListeners();
  }

  function sendToUIListeners() {
    new GuiMessage("fetchEvents-result", eventsStorage)
      .send();
  }

  window.addEventListener ("fetchEvents", () => {
    sendToUIListeners();
    
    var userIdentifier = window.localStorage.getItem('userName');
    if(! userIdentifier) {
        setTimeout(() => {
          new GuiMessage("fetchEvents", undefined, "global").send();
        }, 3000);
        return;
    }

    if (tracker.hasFetchedRecently()) return;
    if (tracker.hasNotFetchedForLong()) {
      sendToUIListeners();
      tracker.fetchNow();
    } else if (! lastHookFetch) {
      lastHookFetch = setTimeout(() => {
        if (tracker.hasNotFetchedForLong()) {
          tracker.fetchNow();
        }
        lastHookFetch = null;
      }, 3000);
    }
  });

})();
