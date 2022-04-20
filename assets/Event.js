function Event ({ strDate, strTime, strDescription, kind, userInitiator }) {
  this.date = MyDate.fromFormattedString(strDate);
  this.time = strTime;
  this.description = strDescription;
  this.kind = kind;
  this.userInitiator = userInitiator;
}

Event.prototype = {
  isUnreadForUser: false,
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
  }
};

Event.read = function (data) {
  if (! data)
    return null;
  var { version } = data;
  if (version == 1) {
    var event = new Event (data);
    event.send = function() {
        throw "Unable to send an event read from the network";
    }
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
        fetchTime = 0,
        isFetching = false;

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
      fetchNow: function(eventToSend, allowReentrant) {
        if(isFetching && !allowReentrant) return;
        isFetching = true;
        new NetworkMessage({
          method: "POST",
          url: `send_event?from=${trackTime}`,
          data: eventToSend || null
        }).send()
        .then(({ content }) => contentHandler(content))
        .then(({ userIdentifier, isConsideredOver, lastFetchTime }) => {
            this.trackTime = lastFetchTime;
            return !isConsideredOver ? this.fetchNow(undefined, true) : sendToUIListeners();
        }).then(() => (isFetching = false));
      },
      acknowledgeEvents: function() {
          for(day in eventsStorage) {
              for(time in eventsStorage[day]) {
                  delete eventsStorage[day][time].isUnreadForUser;
              }
          }
          var userInitiator = window.localStorage.getItem('userName');
          if(! userInitiator) return;
          this.fetchNow({
              cursor: trackTime,
              userInitiator,
              type: "cursor_move"
          }).send().then(() => new GuiMessage("eventMap-updates", eventsStorage).send());
      }
    };
  })();
  
  /* Tracker is acting on Event Prototype */
    Event.prototype.send = function() {
        var data;
        if (! this.userInitiator) {
            var userFromStorage = window.localStorage.getItem('userName');
            this.userInitiator = userFromStorage;
        }
        this.print(_ => (data = _));
        return tracker.fetchNow(data);
    };

  function contentHandler (content) {
    var records = JSON.parse (content)
        .filter(([_1, _2]) => !!_1 && !!_2);
    
    var lastFetchTime = records.isNotEmpty() ? records.last()[1] : undefined;
    var userIdentifier = window.localStorage.getItem('userName');
    
    var lastReadCursor = 0;
    for(let record of records) {
        const { userInitiator, type, cursor } = record[0] /* = event */;
        if(type == 'cursor_move' && userInitiator == userIdentifier) {
            if (lastReadCursor <= cursor)
                lastReadCursor = cursor;
        }
    }
        
    var timestampedEvents = records
        .map(([data, timeTrack]) => ([Event.read(data), timeTrack]))
        .filter(([_1]) => !!_1)
        .sortedBy (([_1, timeTrack]) => timeTrack);
    
    for(let record of timestampedEvents) {
        var [event, timetrack] = record;
        var dateKey = event.dateKey();
        if(event.kind == 'cancel') {
            if (eventsStorage[dateKey] && eventsStorage[dateKey][event.time]) {
                delete eventsStorage[dateKey][event.time];
                if(Object.keys(eventsStorage[dateKey]).length == 0)
                    delete eventsStorage[dateKey];
            }
        } else if (event.kind == 'create') {
            if (! eventsStorage[dateKey])
                eventsStorage[dateKey] = {};
            eventsStorage[dateKey][event.time] = event;
        }
        
        // Manage unread events 
        if(timetrack > lastReadCursor && event.userInitiator && event.userInitiator != userIdentifier) {
            event.isUnreadForUser = true;
        }
    };
    
    return {
        userIdentifier,
        lastFetchTime,
        isConsideredOver: records.length < 50
    };
  }

  function sendToUIListeners() {
    return Promise.all([
        new GuiMessage("fetchEvents-result", eventsStorage).send(),
        new GuiMessage("eventMap-updates", eventsStorage).send()
    ]);
  }
  
  window.addEventListener("acknowledgeEvents", () => {
    tracker.acknowledgeEvents();
  });

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
