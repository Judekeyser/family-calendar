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
        kind = this.kind;

    printer ({
      strDate,
      strTime,
      strDescription,
      kind
    });
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
  isUnreadForUser: function() { return false; }
};

Event.read = function (data) {
  if (! data)
    return null;
  var { version } = data;
  if (version == 1) {
    if(data.kind != "create" && data.kind != "cancel")
        return null;
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
        return new NetworkMessage({
          method: "POST",
          url: `send_event.php?from=${trackTime}`,
          data: eventToSend || null
        }).send()
        .then(({ content }) => contentHandler(content))
        .then(({
            timestampedEvents,
            checkUnreadForUser,
            lastFetchTime,
            isConsideredOver
        }) => {
            eventsHandler(timestampedEvents);
            return { checkUnreadForUser, lastFetchTime, isConsideredOver };
        })
        .then(({ checkUnreadForUser, lastFetchTime, isConsideredOver }) => {
            this.trackTime = lastFetchTime;
            if(!!checkUnreadForUser)
                Event.prototype.isUnreadForUser = checkUnreadForUser;
            return !isConsideredOver ? this.fetchNow(undefined, true) : sendToUIListeners();
        }).then(() => {
            isFetching = false;
            fetchTime = Date.now();
        });
      },
      acknowledgeEvents: function() {
        Event.prototype.send.bind({
            cursor: trackTime,
            print: function(printer) {
                printer({
                    cursor: this.cursor,
                    kind: "cursor_move"
                });
            }
        })().then(() => new GuiMessage("eventMap-updates", eventsStorage).send());
      }
    };
  })();
  
  /* Tracker is acting on Event Prototype */
    Event.prototype.send = function() {
        var data;
        this.print(_ => (data = _));
        data.version = data.version || 1;
        if (! data.userInitiator) {
            var userFromStorage = window.localStorage.getItem('userName');
            data.userInitiator = userFromStorage;
        }
        return tracker.fetchNow(JSON.stringify(data));
    };

  function contentHandler (content) {
    var records = JSON.parse (content)
        .filter(_ => !!_)
        .filter(([_1, _2]) => !!_1 && !!_2);
    
    var lastFetchTime = records.isNotEmpty() ? records.last()[1] : undefined;
    const userIdentifier = window.localStorage.getItem('userName');
    
    let lastReadCursor = null;
    for(let record of records) {
        const { userInitiator, kind, cursor } = record[0] /* = event */;
    
        if(kind == 'cursor_move' && userInitiator == userIdentifier) {
            if (!lastReadCursor || lastReadCursor <= cursor)
                lastReadCursor = cursor;
        }
    }
        
    var timestampedEvents = records
        .map(([data, timeTrack]) => ([Event.read(data), timeTrack]))
        .filter(([_1]) => !!_1)
        .sortedBy (([_1, timeTrack]) => timeTrack);
    
    return {
        timestampedEvents,
        checkUnreadForUser: !lastReadCursor ? null : function() {
            const isNew = this.__history && this.__history.timetrack > lastReadCursor;
            const isFromSomeoneElse = this.userInitiator && this.userInitiator != userIdentifier;
            return isNew && isFromSomeoneElse;
        },
        lastFetchTime: lastFetchTime - 1, // This is based on the very strong property of chain-idempotency
        isConsideredOver: records.length < 50
    };
  }
  
  function eventsHandler(timestampedEvents, lastReadCursor) {
    for(let record of timestampedEvents) {
        var [event, timetrack] = record;
        event.__history = { timetrack };
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
    };
  }

  function sendToUIListeners() {
    return Promise.all([
        new GuiMessage("fetchEvents-result", eventsStorage).send(),
        new GuiMessage("eventMap-updates", eventsStorage).send()
    ]);
  }
  
  window.addEventListener("acknowledgeEvents", () => tracker.acknowledgeEvents());

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
