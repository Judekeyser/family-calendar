NetworkMessage.baseUrl = document
                        .querySelector("base")
                        .getAttribute("href");
NetworkMessage.csrfToken = document
                           .querySelector("dialog form input[type=hidden]")
                           .getAttribute("value");

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


/***************************  DATE PICKER COMPONENT  ***************************
********************************************************************************

Listens to:
  nothing

Emits:
  - focus-on: { date }
  date: the date chosen by the picker, may be undefined

*******************************************************************************/

(function() {
  var datePicker = document.menuCtrl.directDateInput;

  function emitEvent() {
    var value = this.value,
         date = value && MyDate.fromFormattedString(value);

    new GuiMessage("focus-on", { date }, "global") .send();
  };

  datePicker.addEventListener("change", emitEvent);
  window.addEventListener("load", function() {
    datePicker.value = MyDate.now().asFormattedString();
    emitEvent.bind(datePicker)();  
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
        tds[j].innerHTML = "";
        var cellChild = document.createElement("span");
        cellChild.textContent = dateCursor.twoDigitsDay();
        if (this.date && this.date.equals(dateCursor)) {
          console.log(cellChild);
          cellChild.classList.add("active-link");
        } else {
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
          if (this.date.hasSameMonthThan(dateCursor)) ;
          else {
            cellChild.classList.add("out-of-month");
          }
        }
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
                   .map(({ key, value }) => ({
                     key, 
                     values: (value || [])
                   }))
                   .map(({key, values}) => ({
                     key,
                     valuesPerTime: values
                                    .map(event => event.perDayProjection())
                                    .groupBy(({ time }) => time)
                                    .map(group => ({
                                      key: group.key,
                                      last: group.values.last()
                                    }))
                                    .filter(({ last }) => !!last)
                                    .filter(({ last }) => last.kind == 'create')
                   }))
                   .filter(({ valuesPerTime }) => !valuesPerTime.isEmpty())
                   .map(({ key }) => key)
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

  view.paint = function() {
    if (!this.weekCount || !this.monday) return;

    var scs = content.getElementsByTagName("section");
    while (scs.length > this.weekCount) {
      content.removeChild (scs[this.weekCount]);
    }
    while (scs.length < this.weekCount*7) {
      content.appendChild(
      document.createElement("section")
      );
    }

    var dateCursor = this.monday;
    for (let i = 0; i < scs.length; i++) {
      var section = scs[i];
      section.innerHTML = "";
      var h1 = document.createElement("h1");
      h1.textContent = dateCursor.asFormattedString();
      section.appendChild(h1);
      dateCursor = dateCursor .nextDate();
    }
  }

  content.addEventListener("view-update", function({ detail }) {
    var { date, weekCount, monday, today } = detail;
    view .date = date;
    view .weekCount = weekCount;
    view .monday = monday;

    view .paint();
    new GuiMessage("fetchEvents", undefined, "global")
      .send();
    });

    content.addEventListener("fetchEvents-result", function ({ detail }) {
      var eventMap = detail;

      [...content.querySelectorAll("section")]
      .map(section => ({
        section,
        values: eventMap[section.querySelector("h1").textContent] || []
      }))
      .map(({section, values}) => ({
        section,
        valuesPerTime: values
                       .map(event => event.perDayProjection())
                       .groupBy(({ time }) => time)
                       .map(group => ({
                         key: group.key,
                         last: group.values.last()
                       }))
                       .filter(({ last }) => !!last)
                       .map(({ last }) => last)
                       .filter(({ kind }) => kind == "create")
                       .sortedBy(({ time }) => time)
      }))
      .peek(({ section }) => {
        var pars = section.getElementsByTagName("p");
        while(pars.length > 0)
          section.removeChild(pars[0]);
      }) 
      .forEach(({ section, valuesPerTime }) => {
        if (valuesPerTime.isEmpty()) {
          section.style.display = "none";
        } else {
          valuesPerTime.forEach(({ time, description }) => {
          var p = document.createElement("p"),
           span = document.createElement("span");
          span.textContent = '[\u2715]';
          span.classList.add("cancel-button");
          p.appendChild(span);
          span.onclick = function() {
            new Event({
              strDate: section.querySelector("h1").textContent,
              strTime: time,
              kind: "cancel"
            }).send().then(() => {
              new GuiMessage("fetchEvents", undefined, "global").send();
            })
          };
          p.appendChild(document.createTextNode(`${time} - ${description}`));
          section.appendChild(p);
        });
        section.style.display = "block";
      }
    });
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
  var dialog = document.querySelector("dialog"),
        form = dialog.querySelector("form"),
   dateLabel = form.querySelector("legend span");

  dialog.addEventListener("ask-user-appointment-details", function({ detail }) {
    var { date } = detail;
    dateLabel.textContent = date.asFormattedString();
    this.showModal();
  });

  dialog.addEventListener("close", function() {
    if (this.returnValue == "confirm") {
      var time      = form.time.value,
        description = form.shortTitle.value;
      if (time && description) {
        new Event({
          strDate: dateLabel.textContent,
          strTime: time,
          strDescription: description,
          kind: "create"
        }).send().then(() =>
          new GuiMessage("fetchEvents", undefined, "global").send()
        );
      }
    }
    form.time.value = "";
    form.shortTitle.value = "";
  });
})();
