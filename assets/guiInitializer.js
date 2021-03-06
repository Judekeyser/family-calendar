function __utils_addOrRemoveStyle({ element, style, test }) {
    if(test) {
        element.classList.add(style);
    } else {
        element.classList.remove(style);
    }
}
function __utils_addOrRemoveStyles({ element, directives }) {
    for(let directive of directives) {
        __utils_addOrRemoveStyle({ ... directive, element });
    }
}

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
    patch(detail /* { date } */);
  });

  window.addEventListener("view-size", function({ detail }) {
    patch(detail /* { weekCount } */);
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
  var button = document.getElementById("menuCtrl_nextWeek");

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
  var button = document.getElementById("menuCtrl_previousWeek");

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

  datePicker.addEventListener("change", emitEvent);
  datePicker.addEventListener("change-date", function({ detail }) {
    var { previous, next } = detail,
                      date = getValue();
    if (! date) return;
    if (next) {
      for (let i = 0; i < 7; i++)
        date = date.nextDate();
    } else if (previous) {
      for (let i = 0; i < 7; i++)
        date = date.previousDate();
    }
    this.value = date.asFormattedString();
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
  window.addEventListener("load", emitEvent.bind(slider));
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
    function Cell({ date }) {
        this.date = date;
        this.controlElement = document.createElement("span");
    }; Cell.prototype = {
        paint: function() {
            var element = this.controlElement;
            element.classList.add("fetchEvents-result"); // Make element aware of fetchEvents
            
            __utils_addOrRemoveStyles({ element,
                directives: [{
                    style: "active-link",
                    test: this.isEqualToReferenceDate()
                }, {
                    style: "out-of-month",
                    test: !this.isInMonthOfReferenceDate()
                }]
            });
            
            element.addEventListener(
                "click",
                this.handleCellClick.bind(this)
            );
            element.addEventListener(
                "fetchEvents-result",
                ({ detail }) => this.handleEventsFlow.bind(this)({ eventMap: detail })
            );
            element.textContent = this.date.twoDigitsDay();
            return element;
        },
        isEqualToReferenceDate: function() { return false; },
        isInMonthOfReferenceDate: function() { return false; },
        handleCellClick: function() {
            new GuiMessage("ask-user-appointment-details", {
                date: {
                    placeholder: this.date.asFormattedString(),
                    isReadonly: true
                }
            }).send();
        },
        handleEventsFlow: function({ eventMap }) {
            __utils_addOrRemoveStyle({
                element: this.controlElement,
                style: "cell-with-event",
                test: !!eventMap[this.date.asFormattedString()]
            });
        }
    };
    
    function Row({ cells }) {
        this.cells = cells;
    }; Row.prototype = {
        paint: function() {
            var element = document.createElement("tr");
            for(let cell of this.cells) {
                var cellElement = document.createElement("td");
                cellElement.appendChild(cell.paint());
                element.appendChild(cellElement);
            }
            return element;
        }
    }
    
    function Table({ referenceDate, rowCount, focusDate }) {
        Cell.prototype.isEqualToReferenceDate = function() {
            return focusDate.equals(this.date);
        };
        Cell.prototype.isInMonthOfReferenceDate = function() {
            return focusDate.hasSameMonthThan(this.date);
        };
        
        this.__generateRows({ referenceDate, rowCount });
    }; Table.prototype = {
        __generateRows: function({ referenceDate, rowCount }) {
            var dateCursor = referenceDate;
            var rows = [];
            for(let i = 0; i < rowCount; i++) {
                let cells = [];
                for(let j = 0; j < 7; j++, dateCursor=dateCursor.nextDate())
                    cells[j] = new Cell({ date: dateCursor });
                
                rows.push(new Row({ cells }));
            }
            
            this.rows = rows;
        },
        paint: function(target) {
            var tbody = target.querySelector("tbody");
            tbody.innerHTML = "";
            
            for(let row of this.rows)
                tbody.appendChild(row.paint());
        }
    };

    document.querySelector("#calendar_view_table").addEventListener("view-update", function({ detail }) {
        var { date, weekCount, monday, today } = detail;
        if (!weekCount || !monday) return;
        
        window.requestAnimationFrame(() => {
            new Table({
                referenceDate: monday,
                focusDate: date,
                rowCount: weekCount
            }).paint(this);

            new GuiMessage("fetchEvents", undefined, "global").send();
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
      let dtElement = scs[this.weekCount];
      removeNextDDs(dtElement);
      content.removeChild (dtElement);
    }
    while (scs.length < this.weekCount*7) {
      content.appendChild(document.createElement("dt"));
    }

    var dateCursor = this.monday;
    for(let dtElement of scs) {
      dtElement.textContent = dateCursor.asFormattedString();
      dateCursor = dateCursor .nextDate();
    }
  }

  content.addEventListener("view-update", function({ detail }) {
    paint.bind(detail /* { date, weekCount, monday, today } */)();
    new GuiMessage("fetchEvents", undefined, "global").send();
  });

  content.addEventListener("fetchEvents-result", function ({ detail }) {
    var eventMap = detail;
    
    for(let dtElement of content.querySelectorAll("dt")) {
        let dailyValues = eventMap[dtElement.textContent] || {};
        let valuesPerTime = Array.asKeyValueStream(dailyValues)
                    .map(({ value }) => value.perDayProjection())
                    .sortedBy(({ time }) => time);
                    
        removeNextDDs(dtElement);
        let nextDt = dtElement.nextElementSibling;
        if (valuesPerTime.isEmpty()) {
          dtElement.style.display = "none";
        } else {
          valuesPerTime.forEach(({ time, description }) => {
            let dd = document.createElement("dd");
            let span = document.createElement("span");
            span.classList.add("clickable_appointment");
            dd.appendChild(span);
            span.onclick = function() {
              new GuiMessage("ask-user-appointment-details",
                {
                  date: {
                    placeholder: dtElement.textContent
                  },
                  time: {
                    placeholder: time
                  },
                  shortTitle: {
                    placeholder: description
                  },
                  mode: "edit"
                }
              ).send();
            };
            span.appendChild(document.createTextNode(`${time} - ${description}`));
            content.insertBefore(dd, nextDt);
          });
          dtElement.style.display = "block";
        }
    }
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
        let dayGroup = eventMap[day];
        checkForAtLeastOneUnread: {
            for(time in dayGroup)
                if(dayGroup[time].isUnreadForUser()) break checkForAtLeastOneUnread;
            continue dayLoop;
        }
        let dtElement = document.createElement("dt");
        dtElement.textContent = day;
        content.appendChild(dtElement);
        
        section.style.display = "block";
        
        for(time in dayGroup)
            if(dayGroup[time].isUnreadForUser()) {
                let ddElement = document.createElement("dd");
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
  - ask-user-appointment-details: { date: H, time: H, shortTitle: H, mode }
    where H = { placeholder, isReadonly }
      and mode = new, edit
  asks the user for appointment details to add at the provided date

Emits:
  nothing: an Event is sent if modal information are validated

*******************************************************************************/

(function() {
  var     dialog = document.querySelector("dialog.ask-user-appointment-details"),
      shortTitle = document.getElementById("shortTitle"),
            time = document.getElementById("time"),
            date = document.getElementById("date"),
      confirmBtn = document.getElementById("details-btn-confirm"),
      cancelArea = document.getElementById("cancelAppointmentArea")
      cancelCbox = document.getElementById("cancelAppointmentMode");
  
    var binding; // H 
    
    shortTitle.addEventListener("change", () => binding.handleShortTitleChange());
    shortTitle.addEventListener("input", () => binding.handleShortTitleChange());
    cancelCbox.addEventListener("change", () => binding.handleCheckboxChange());
    
    var genericBehavior = {
        initializeFields: function() {
            date.value = this.date.placeholder;
            time.value = this.time.placeholder;
            shortTitle.value = this.shortTitle.placeholder;
            
            date.disabled = this.date.isReadonly;
            time.disabled = this.time.isReadonly;
            shortTitle.disabled = this.shortTitle.isReadonly;
            
            cancelCbox.checked = false;
            confirmBtn.textContent = "+";
        },
        collect: function() {
            var eventData = {
                strDate: date.value,
                strTime: time.value,
                strDescription: shortTitle.value,
                kind: "create"
            };
            return eventData;
        }
    }
  
    var behaviorOnNew = {
        initialize: function() {
            this.initializeFields();
            cancelArea.classList.add("out-of-flow");
            cancelCbox.disabled = true;
            confirmBtn.textContent = "+";
        },
        handleShortTitleChange: function() {}
    };
    
    var behaviorOnEdit = {
        initialize: function() {
            this.initializeFields();
            cancelArea.classList.remove("out-of-flow");
            cancelCbox.disabled = false;
        },
        handleShortTitleChange: function() {
            cancelArea.classList.add("out-of-flow");
            cancelCbox.disabled = true;
        },
        handleCheckboxChange: function() {
            if(cancelCbox.checked) {
                date.disabled = true;
                time.disabled = true;
                shortTitle.disabled = true;
                
                date.value = this.date.placeholder;
                time.value = this.time.placeholder;
                
                confirmBtn.textContent = "Confirmer l'annulation";
            } else {
                date.disabled = this.date.isReadonly;
                time.disabled = this.time.isReadonly;
                shortTitle.disabled = this.shortTitle.isReadonly;
                
                confirmBtn.textContent = "+";
            }
        },
        collect: function() {
            var eventToRemove = {
                strDate: this.date.placeholder,
                strTime: this.time.placeholder,
                strDescription: this.shortTitle.placeholder,
                kind: "cancel"
            };
            if(cancelCbox.checked) {
                return eventToRemove;
            } else {
                var eventToCreate = genericBehavior.collect.bind(this)();
                if (eventToCreate.strDate == eventToRemove.strDate && eventToCreate.strTime == eventToRemove.strTime) {
                    return eventToCreate;
                } else return [eventToRemove, eventToCreate];
            }
        }
    }
    
    Object.setPrototypeOf(behaviorOnNew, genericBehavior);
    Object.setPrototypeOf(behaviorOnEdit, genericBehavior);

  dialog.addEventListener("ask-user-appointment-details", function({ detail }) {
    const datePlaceholder = (detail && detail.date && detail.date.placeholder) || null;
    const isDateReadonly = (detail && detail.date && detail.date.isReadonly) || false;
    const timePlaceholder = (detail && detail.time && detail.time.placeholder) || null;
    const isTimeReadonly = (detail && detail.time && detail.time.isReadonly) || false;
    const shortTitlePlaceholder = (detail && detail.shortTitle && detail.shortTitle.placeholder) || '';
    const isShortTitleReadonly = (detail && detail.shortTitle && detail.shortTitle.isReadonly) || false;
    
    const mode = (detail && detail.mode) || "new";
    binding = {
        date: {
            placeholder: datePlaceholder,
            isReadonly: isDateReadonly
        },
        time: {
            placeholder: timePlaceholder,
            isReadonly: isTimeReadonly
        },
        shortTitle: {
            placeholder: shortTitlePlaceholder,
            isReadonly: isShortTitleReadonly
        }
    };
    
    if(mode == "new") {
        Object.setPrototypeOf(binding, behaviorOnNew);
    } else if (mode == "edit") {
        Object.setPrototypeOf(binding, behaviorOnEdit);
    }
    
    binding.initialize();
    
    this.showModal();
  });

  dialog.addEventListener("close", function() {
    if (this.returnValue == "confirm") {
      if (date.value && time.value && shortTitle.value) {
          var data = binding.collect();
          if (Array.isArray(data)) {
              var task$ = new Event(data[0]).send()
                            .then(() => new Event(data[1]).send());
          } else {
              var task$ = new Event(data).send();
          }
          task$.then(() => new GuiMessage("fetchEvents", undefined, "global").send())
      }
    }
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
