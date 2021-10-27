NetworkMessage.baseUrl = document.querySelector("base").getAttribute("href");

var panelSection = (function() {
	var section          = document.querySelector("section"),
	    largeContentBox  = section.querySelector("div#content"),
	    contentContainer = section.querySelector("div#day-detail"),
	    header           = section.querySelector("header"),
	    h1               = header.querySelector("h1"),
	    form             = largeContentBox.querySelector("form"),
	    panelDate        = undefined;

	h1.addEventListener("click", function() {
		const OPENED = "opened";
		if (header.classList.contains(OPENED)) {
			header.classList.remove(OPENED);
		} else {
			header.classList.add(OPENED);
		}
	});

	section.addEventListener("focus-on", function({ detail }) {
		var targetDate = detail;
		panelDate = targetDate;
		if (! panelDate) {
			h1.textContent = "Choisir une date...";
			largeContentBox.style.display = "none";
		} else {
			h1.textContent = targetDate.asFormattedString();
			contentContainer.textContent = "Chargement des données...";
			window.dispatchEvent(new CustomEvent("fetchEvents"));
			largeContentBox.style.display = "block";
		}
	});

	section.addEventListener("fetchEvents-result", function({ detail }) {
		var events = detail;
		contentContainer.innerHTML = "";

		events = (events[panelDate.asFormattedString()] || [])
					.map(event => event.perDayProjection());

		events = events.groupBy(({ time }) => time)
			.map(({ key, values }) => {
				for(var lastIndexOfCreate = values.length - 1; lastIndexOfCreate >= 0; lastIndexOfCreate--) {
					if (values[lastIndexOfCreate].kind == "create")
						break;
				}

				if (lastIndexOfCreate == -1) {
					console.log("Weird: events for timing", key, "never found a create state", values);
					return null;
				} else {
					var event = {... values[lastIndexOfCreate]};
					for (let i = lastIndexOfCreate; i < values.length; i++)
						if (values[i].kind == "cancel")
							event.isCancelled = true;
					return event;
				}
			}).filter(_ => !!_);
		;

		if (events.isEmpty()) {
			var p = document.createElement("p");
			p.textContent = "Il n'y a pas encore de rendez-vous à cette date.";
			contentContainer.appendChild(p);
		} else {
			var dl = document.createElement("dl");
			events
				.sortedBy(({ time }) => time)
				.forEach(({ time, description, isCancelled }) => {
					var dt = document.createElement("dt");
					if (isCancelled) {
						dt.classList.add("cancelled");
					} else {
						var cancelButton = document.createElement("button");
						cancelButton.setAttribute("title", "Annuler le rendez-vous");
						cancelButton.textContent = "\u2718";
						var eventData = {
							strDate: panelDate.asFormattedString(),
							strTime: time,
							kind: "cancel"
						};
						cancelButton.onclick = function() {
							var event = new Event (eventData);
							event.send().then(() => {
								window.dispatchEvent(new CustomEvent("fetchEvents"));
							});
						};
						dt.appendChild(cancelButton);
					}
					var timeText = document.createElement("span");
					timeText.textContent = time;
					dt.appendChild(timeText);
					var dd = document.createElement("dd");
					dd.textContent = description;
					dl.appendChild(dt);
					dl.appendChild(dd);
				});
			contentContainer.appendChild(dl);
		}
	});

	form.onsubmit = function(event) {
		event.preventDefault();
		var shortTitle = this.shortTitle.value || undefined,
		    time       = this.time.value || undefined;

		var eventData = {
			strDate: panelDate.asFormattedString(),
			strTime: time,
			strDescription: shortTitle,
			kind: "create"
		};
		var event = new Event(eventData);
		event.send().then(() => {
			window.dispatchEvent(new CustomEvent("fetchEvents"));
		})
		return false;
	}
})();


var menuTable = (function() {
	var table = document.querySelector("nav table"),
	    tbody = table.querySelector("tbody");

	var _ = {
		repaint: function() {
			if (! this.expectedRowCount || !this.referenceDate) return;

			var trs = tbody.getElementsByTagName("tr");
			while (trs.length > this.expectedRowCount) {
				tbody.removeChild (trs[this.expectedRowCount]);
			}
			while (trs.length < this.expectedRowCount) {
				var tr = document.createElement("tr");
				for (let i = 0; i < 7; i++)
					tr.appendChild(document.createElement("td"));
				tbody.appendChild(tr);
			}

			var dateCursor = this.referenceDate;
			for (let i = 0; i < trs.length; i++) {
				var tds = trs[i].getElementsByTagName("td");
				for (let j = 0; j < tds.length; j++) {
					tds[j].innerHTML = "";
					if (this.focusDate && this.focusDate.equals(dateCursor)) {
						var cellChild = document.createElement("span");
						cellChild.classList.add("active-link");
					} else {
						var cellChild = document.createElement("a");
						cellChild.setAttribute("href", `/?focus=${dateCursor.asFormattedString()}`);
						cellChild.onclick = function(event) {
							event.preventDefault();
							window.dispatchEvent(new CustomEvent("force-location-change", {
								detail: this.getAttribute("href")
							}));
							return false;
						}
					}
					cellChild.textContent = dateCursor.twoDigitsDay();
					tds[j].appendChild(cellChild);
					if (this.boldMarkerPredicate && this.boldMarkerPredicate(dateCursor)) {
						tds[j].style.fontWeight = "bold";
					}
					dateCursor = dateCursor .nextDate();
				}
			}
		},
		updateRows: function({ expectedRowCount, boldMarkerPredicate }) {
			var mustRepaint = false;
			if (expectedRowCount && this.expectedRowCount != expectedRowCount) {
				this.expectedRowCount = expectedRowCount;
				mustRepaint = true;
			}
			if (boldMarkerPredicate) {
				this.boldMarkerPredicate = boldMarkerPredicate;
				mustRepaint = true;
			}
			if (mustRepaint) {
				this.repaint();
			}
		},
		updateReference: function (referenceDate) {
			var shouldUpdate = true;
			if (this.referenceDate && ! this.referenceDate.equals(referenceDate)) {
				if (this.expectedRowCount) {
					var cursor = this.referenceDate;
					for(let i = 0; i < this.expectedRowCount; i++) {
						for (let j = 0; j < 7; j++) {
							if (cursor.equals (referenceDate)) {
								shouldUpdate = false;
							} else cursor = cursor.nextDate();
						}
					}
				}
			}

			if (shouldUpdate) {	
				this.referenceDate = referenceDate;
				this.repaint();
			}
		},
		setFocus: function (focusDate) {
			if (!focusDate || !this.focusDate || ! focusDate.equals(this.focusDate)) {
				this.focusDate = focusDate;
				this.repaint();
			}
		}
	};

	table.addEventListener("focus-on", function({ detail }) {
		var focusDate = detail;
		if (! focusDate) return;
		_.setFocus(focusDate);

		var monday = focusDate;
		while (! monday.isMonday())
			monday = monday.previousDate();
		_.updateReference(monday);
	});

	table.addEventListener("fetchEvents-result", function({ detail }) {
                var eventsStorage = detail,
		    boldPredicate = date => (eventsStorage[date.asFormattedString()] || []).isNotEmpty();
		_.updateRows({ boldMarkerPredicate: boldPredicate });
	});

	return _;
})();

var rowCountSliderController = ((ctrl) => {
	menuTable.updateRows ({ expectedRowCount: ctrl.value });
});


document.menuCtrl.rowCountSlider.addEventListener("change", function() { rowCountSliderController(this); });
rowCountSliderController(document.menuCtrl.rowCountSlider);

var directDateInputController = ((ctrl, value) => {
	if (! value) {
		var date = MyDate.now();
	} else {
		var date = MyDate.fromFormattedString(value);
	}
	if (ctrl.value != date.asFormattedString()) {
		ctrl.value = date.asFormattedString();
	}
});

document.menuCtrl.directDateInput.addEventListener("change", function() {
	if (this.value)
		dispatchEvent(new CustomEvent("force-location-change", { detail: `/?focus=${this.value}` }));
});
document.menuCtrl.directDateInput.addEventListener("focus-on", function({ detail }) {
	var focusDate = detail;
	directDateInputController(this, focusDate && focusDate.asFormattedString());
});
directDateInputController(document.menuCtrl.directDateInput, document.menuCtrl.directDateInput.value);
