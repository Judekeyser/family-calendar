/***********************  VIRTUAL VIEW UPDATE COMPONENT  ***********************
********************************************************************************

Listens to:
  - focus-on: { date }
  date: the date chosen by a date picker
  - view-size: { weekCount }
  weekCount: the number of week to display

Emits:
  - view-update: { date, weekCount, monday, today }
  none are undefined

*******************************************************************************/

(function() {
  var focusDate, viewSize,
      listeners = {
        "focus-on": ({ detail }) => {
          var { date } = detail;
          patch ({ date });
        },
        "view-size": ({ detail }) => {
          var { weekCount } = detail;
          patch ({ weekCount });
        }
      };

  function patch({ date, weekCount }) {
    if (! date && focusDate)
      patch({ date: focusDate, weekCount });
    else if (! weekCount && viewSize)
      patch({ date, weekCount: viewSize });
    else {
      focusDate = date;
      viewSize = weekCount;

      if (focusDate && viewSize) {
        var monday = focusDate;
        while(! monday.isMonday())
          monday = monday.previousDate();
        new GuiMessage("view-update", {
          date,
          weekCount,
          monday,
          today: MyDate.now()
        }).send();
      }
    }  
  }

  window.addEventListener("focus-on", function({ detail }) {
    var { date } = detail;
    patch({ date });
  });

  window.addEventListener("view-size", function({ detail }) {
    var { weekCount } = detail;
    patch({ weekCount });
  });
})();


/************************  NEXT WEEK BUTTON COMPONENT  *************************
********************************************************************************

Listens to:
  nothing

Emits:
  - change-date: { next = true }

*******************************************************************************/

(function() {
  var button = document.menuCtrl.nextWeek;

  button.addEventListener("click", function() {
    new GuiMessage("change-date", { next: true }) .sendTo(
      document.menuCtrl.directDateInput
    );
  });
})();


/**********************  PREVIOUS WEEK BUTTON COMPONENT  ***********************
********************************************************************************

Listens to:
  nothing

Emits:
  - change-date: { previous = true }

*******************************************************************************/

(function() {
  var button = document.menuCtrl.previousWeek;

  button.addEventListener("click", function() {
    new GuiMessage("change-date", { previous: true }) .sendTo(
      document.menuCtrl.directDateInput
    );
  });
})();


/***************************  DATE PICKER COMPONENT  ***************************
********************************************************************************

Listens to:
  - change-date: { previous = true } || { next = true }

Emits:
  - focus-on: { date }
  date: the date chosen by the picker, may be undefined

*******************************************************************************/

(function() {
  var datePicker = document.menuCtrl.directDateInput;

  function getValue() {
    var value = datePicker.value;
    return value && MyDate.fromFormattedString (value);
  }

  function emitEvent() {
    var date = getValue();
    new GuiMessage("focus-on", { date }, "global") .send();
  };

  datePicker.addEventListener("change", () => emitEvent());
  datePicker.addEventListener("change-date", ({ detail }) => {
    var { previous, next } = detail,
                      date = getValue();
    if (! date) return;
    if (next) {
      for (let i = 0; i < 7; i++)
        date = date .nextDate();
    } else if (previous) {
      for (let i = 0; i < 7; i++)
        date = date .previousDate();
    }
    datePicker.value = date.asFormattedString();
    emitEvent();
  });
  window.addEventListener("load", function() {
    datePicker.value = MyDate.now().asFormattedString();
    emitEvent();
  });
})();


/************************  WEEK COUNT SLIDER COMPONENT  ************************
********************************************************************************

Listens to:
  nothing

Emits:
  - view-size: { weekCount }
  weekCount always defined number

*******************************************************************************/

(function() {
  var slider = document.menuCtrl.rowCountSlider;

  function emitEvent() {
    var weekCount = this.value;

    new GuiMessage("view-size", { weekCount }, "global") .send();
  };

  slider.addEventListener("change", emitEvent);
  window.addEventListener("load", function() {
    emitEvent.bind(slider)();
  });
})();


/***********************  CALENDAR TABLE VIEW COMPONENT  ***********************
********************************************************************************

Listens to:
  - view-update: { date, weekCount, monday, today }
  repaints the component w.r.t. the new view
  emits a fetchEvents
  - fetchEvents-result: { events }
  decorate the cells of the current view

Emits:
  - fetchEvents

*******************************************************************************/

(function() {
  var table = document.querySelector("nav table"),
      tbody = table.querySelector("tbody");

  function paint() {
    if (!this.weekCount || !this.monday) return;

    var trs = tbody.getElementsByTagName("tr");
    while (trs.length > this.weekCount) {
      tbody.removeChild (trs[this.weekCount]);
    }
    while (trs.length < this.weekCount) {
      var tr = document.createElement("tr");
      for (let i = 0; i < 7; i++)
        tr.appendChild(document.createElement("td"));
      tbody.appendChild(tr);
    }

    var dateCursor = this.monday;
    for (let i = 0; i < trs.length; i++) {
      var tds = trs[i].getElementsByTagName("td");
      for (let j = 0; j < tds.length; j++) {
        // clean td element 
        tds[j].innerHTML = "";
        
        // create cell child and reset styles
        var cellChild = document.createElement("span");
        cellChild.textContent = dateCursor.twoDigitsDay();
        if (this.date && this.date.equals(dateCursor)) {
          cellChild.classList.add("active-link");
        }
        if (! this.date.hasSameMonthThan(dateCursor)) {
          cellChild.classList.add("out-of-month");
        }
        
        // add behavior
        cellChild.onclick = function(event) {
          event.preventDefault();
          new GuiMessage("ask-user-appointment-details",
            {
              date: MyDate.fromFormattedString(
                      this.parentElement.getAttribute("data-for-date")
                    )
            }
          ).send();
          return false;
        }
        
        // append cell child into td element
        tds[j].setAttribute("data-for-date", dateCursor.asFormattedString());
        tds[j].appendChild(cellChild);
        dateCursor = dateCursor .nextDate();
      }
    }
  }

  table.addEventListener("view-update", function({ detail }) {
    var { date, weekCount, monday, today } = detail,
                                    struct = { date, weekCount, monday };
    paint.bind(struct)();

    new GuiMessage("fetchEvents", undefined, "global").send();
  });

  table.addEventListener("fetchEvents-result", function ({ detail }) {
    var eventMap = detail,
          events = Array.asKeyValueStream(eventMap)
                   .map(({ key, value }) => key)
                   .toSet();
    
    [...table.querySelectorAll("td")]
    .forEach(element => {
      var forDate = element.getAttribute("data-for-date");
      if (events.has (forDate))
        element.querySelector("span").style.fontWeight = "bold";
    });
  });
})();


/*********************  APPOINTMENTS LISTING VIEW COMPONENT  *******************
********************************************************************************

Listens to:
  - view-update: { date, weekCount, monday, today }
  repaints the component w.r.t. the new view
  emits a fetchEvents
  - fetchEvents-result:
  decorate the component state

Emits:
  - fetchEvents

*******************************************************************************/

(function() {
  var content = document.querySelector("#content"),
         view = {};

  function removeNextDDs (dtElement) {
    var parentElement = dtElement.parentElement;
    do {
      var ddElement = dtElement.nextElementSibling;
      if (ddElement && ddElement.tagName == "DD")
        parentElement.removeChild (ddElement);
      else break;
    } while(true);
  }

  function paint() {
    if (!this.weekCount || !this.monday) return;

    var scs = content.getElementsByTagName("dt");
    while (scs.length > this.weekCount) {
      var dtElement = scs[this.weekCount];
      removeNextDDs(dtElement);
      content.removeChild (dtElement);
    }
    while (scs.length < this.weekCount*7) {
      content.appendChild(
        document.createElement("dt")
      );
    }

    var dateCursor = this.monday;
    for (let i = 0; i < scs.length; i++) {
      var dtElement = scs[i];
      dtElement.textContent = dateCursor.asFormattedString();
      dateCursor = dateCursor .nextDate();
    }
  }

  content.addEventListener("view-update", function({ detail }) {
    var { date, weekCount, monday, today } = detail;
    view .date = date;
    view .weekCount = weekCount;
    view .monday = monday;

    paint.bind(view)();
    new GuiMessage("fetchEvents", undefined, "global").send();
  });

  content.addEventListener("fetchEvents-result", function ({ detail }) {
    var eventMap = detail;
    
    [...content.querySelectorAll("dt")]
    .map(dt => ({
      dt,
      dailyValues: eventMap[dt.textContent] || {}
    }))
    .map(({dt, dailyValues}) => ({
      dt,
      valuesPerTime: Array.asKeyValueStream(dailyValues)
                     .map(({ value }) => value.perDayProjection())
                     .sortedBy(({ time }) => time)
    }))
    .forEach(({ dt, valuesPerTime }) => {
        removeNextDDs(dt);
        var nextDt = dt.nextElementSibling;
        if (valuesPerTime.isEmpty()) {
          dt.style.display = "none";
        } else {
          valuesPerTime.forEach(({ time, description }) => {
            var dd = document.createElement("dd"),
              span = document.createElement("span");
            span.textContent = '[\u2715]';
            span.classList.add("cancel-button");
            dd.appendChild(span);
            span.onclick = function() {
              new Event({
                strDate: dt.textContent,
                strTime: time,
                kind: "cancel"
              }).send().then(() => {
                new GuiMessage("fetchEvents", undefined, "global").send();
              })
            };
            dd.appendChild(document.createTextNode(`${time} - ${description}`));
            content.insertBefore(dd, nextDt);
        });
        dt.style.display = "block";
      }
    });
  });
})();


/*******************  NEW APPOINTMENTS LISTING VIEW COMPONENT  *****************
********************************************************************************

Listens to:
  - newEvents-result:
  decorate the component state

*******************************************************************************/

(function() {
  var content = document.querySelector("#news_content"),
      section = document.querySelector("#news_section"),
      markReadBtn = document.querySelector("#mark_as_read");
  
  section.style.display = "none";
  markReadBtn.addEventListener("click", function() {
      this.disabled = true;
      new GuiMessage("acknowledgeEvents", undefined, "global").send();
  });
  
  function handleEvents(eventMap) {
    content.innerHTML = "";
    section.style.display = "none";
    
    dayLoop: for(day in eventMap) {
        var dayGroup = eventMap[day];
        checkForAtLeastOneUnread: {
            for(time in dayGroup)
                if(dayGroup[time].isUnreadForUser) break checkForAtLeastOneUnread;
            continue dayLoop;
        }
        var dtElement = document.createElement("dt");
        dtElement.textContent = day;
        content.appendChild(dtElement);
        
        section.style.display = "block";
        
        for(time in dayGroup)
            if(dayGroup[time].isUnreadForUser) {
                var ddElement = document.createElement("dd");
                ddElement.appendChild(document.createTextNode(`${time} - ${dayGroup[time].description}`));
                content.appendChild(ddElement);
            }
    }
  }

  content.addEventListener("eventMap-updates", function ({ detail }) {
    var eventMap = detail;
    handleEvents(eventMap);
    markReadBtn.disabled = false;
  });
})();


/**********************  ADD APPOINTMENT DIALOG COMPONENT  *********************
********************************************************************************

Listens to:
  - ask-user-appointment-details: { date }
  asks the user for appointment details to add at the provided date

Emits:
  nothing: an Event is sent if modal information are validated

*******************************************************************************/

(function() {
  var     dialog = document.querySelector("dialog.ask-user-appointment-details"),
      shortTitle = document.getElementById("shortTitle"),
            time = document.getElementById("time"),
        memoDate = null;

  dialog.addEventListener("ask-user-appointment-details", function({ detail }) {
    var { date } = detail;
    memoDate = date;
    this.showModal();
  });

  dialog.addEventListener("close", function() {
    if (this.returnValue == "confirm") {
      if (time.value && shortTitle.value) {
        new Event({
          strDate: memoDate.asFormattedString(),
          strTime: time.value,
          strDescription: shortTitle.value,
          kind: "create"
        }).send().then(() =>
          new GuiMessage("fetchEvents", undefined, "global").send()
        );
      }
    }
    time.value = "";
    shortTitle.value = "";
  });
})();



/***********************  IDENTIFY USER DIALOG COMPONENT  **********************
********************************************************************************

Listens to:
  - ask-user-identification
  asks the user for identification

Emits:
  - user-identification: { userName }
    with the user name. That event should be handled by the event sender
    mechanism to decorate events sent and received.

*******************************************************************************/

(function() {
  var dialog = document.querySelector("dialog.ask-user-identification"),
          id = dialog.querySelector("form").identifiant,
       okBtn = dialog.querySelector('.okBtn'),
     confBtn = dialog.querySelector('.confirmBtn');

  okBtn.addEventListener("click", function() {
    dialog.classList.add('confirm');
    dialog.classList.remove('not-confirm');
  });
  
  ["change", "focus"].forEach(channel => {
      for(let i = 0; i < 2; i++)
      id[i].addEventListener(channel, function() {
        if (id.value) {
          okBtn.disabled = false;
        } else {
          okBtn.disabled = true;
        }
      });
  });

  dialog.addEventListener("ask-user-identification", function() {
    id[0].focus();
    dialog.classList.add('not-confirm');
    dialog.classList.remove('confirm');
    this.showModal();
  });

  dialog.addEventListener("close", function() {
    if (this.returnValue == "confirm") {
        var userName = id.value;
        if (userName) {
            window.localStorage.setItem('userName', userName);
            new GuiMessage('fetchEvents', undefined, "global").send();
            return;
        }
    }
    new GuiMessage("ask-user-identification").send();
  });
  
  window.addEventListener("load", function() {
    var userName = window.localStorage.getItem('userName');
    if (! userName) {
      new GuiMessage("ask-user-identification").send();
    }
  });
})();
