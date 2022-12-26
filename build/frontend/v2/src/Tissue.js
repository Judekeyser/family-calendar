import { BehaviorSubject, filter, distinctUntilChanged, map, combineLatest, mapTo, merge } from 'rxjs';


function sortInPlace(array) {
    array.sort();
    return array;
}

export const Tissue = {
    __fetchTime: 0,
    __authenticationRequiredSubject: new BehaviorSubject(true),
    __identifiedUserSubject: new BehaviorSubject(null),
    
    __viewRowCountSubject: new BehaviorSubject(null),
    __viewFocusDateSubject: new BehaviorSubject(null),
    
    __calendarSubject: new BehaviorSubject(null),
    
    __openedPanelSubject: new BehaviorSubject(""),
    
    authenticationRequired$: function() {
        return this.__authenticationRequiredSubject.pipe(distinctUntilChanged());
    },
    identifiedUser$: function() {
        return this.__identifiedUserSubject.pipe(distinctUntilChanged());
    },
    viewRowCount$: function() {
        return this.__viewRowCountSubject.pipe(distinctUntilChanged());
    },
    viewFocusDate$: function() {
        return this.__viewFocusDateSubject.pipe(distinctUntilChanged());
    },
    dayInGrid$: function(weekCount, dayCount) {
        let dayInGrid$ = this.__monday$.pipe(
            map(monday => {
                let dateTime = monday;
                for(let i = 0; i < (weekCount-1)*7 + (dayCount-1); i++) {
                    dateTime = nextDateTime(dateTime);
                }
                return dateTimeToString(dateTime);
            })
        )
        
        return combineLatest(
            dayInGrid$,
            this.__viewFocusDateSubject
        ).pipe(
            map(([ dayInGrid, focusDay ]) => ({
                sameMonthAsFocus: dayInGrid.substring(5, 7) === focusDay.substring(5, 7),
                dayInGrid: dayInGrid,
                sameDayAsFocus: dayInGrid === focusDay,
                today: dayInGrid === dateTimeToString(new Date())
            }))
        )
    },
    calendarCell$: function(dayInGrid) {
        return merge(
            this.__loadedCalendar$.pipe(
                map(calendar => calendar[dayInGrid] ? {
                    detail: calendar[dayInGrid],
                    sortedKeys: sortInPlace(Object.keys(calendar[dayInGrid]))
                } : { empty: true })
            ),
            this.__spinningWheel$
        )
    },
    unreadCells$: function() {
        return merge(
            this.__loadedCalendar$.pipe(
                map(calendar => {
                    let detail = {};
                    for(let strDate in calendar) {
                        let dayDetail = {};
                        for(let strTime in calendar[strDate]) {
                            if(calendar[strDate][strTime].unread) {
                                dayDetail[strTime] = calendar[strDate][strTime].description;
                                dayDetail.touched = true;
                            }
                        }
                        if(dayDetail.touched) {
                            delete dayDetail.touched;
                            detail[strDate] = {
                                detail: dayDetail,
                                sortedKeys: sortInPlace(Object.keys(dayDetail))
                            };
                            detail.touched = true;
                        }
                    }
                    if(detail.touched) {
                        delete detail.touched;
                        return {
                            detail,
                            sortedKeys: sortInPlace(Object.keys(detail))
                        };
                    } else {
                        return { empty: true };
                    }
                })
            ),
            this.__spinningWheel$
        )
    },
    markAllAsRead: function() {
        
        this.sendEvent({
            newEvent: {
                userInitiator: window.localStorage.getItem('userName'),
                kind: 'cursor_move',
                cursor: this.__fetchTime,
                version: 1
            }
        });
    },
    openedPanel$: function() {
        return this.__openedPanelSubject
    },
    openPanel: function(hashSegment) {
        let hash = encodeURIComponent(btoa(hashSegment.join("/")));
        window.history.pushState(hashSegment, "", "#"+hash);
        this.__openedPanelSubject.next(hashSegment);
    },
    closePanel: function() {
        window.history.back();
    },
    sendEvent: async function({ newEvent, password, continueSignal }) {
        let fromTime = this.__fetchTime;
        
        let options = { newEvent, password, continueSignal };
        
        return new Task(fromTime, () => undefined, options).run();
    },
    setAuthenticationRequired: function(state) {
        this.__authenticationRequiredSubject.next(state);
    },
    setUser: function(user) {
        this.__identifiedUserSubject.next(user || null);
    },
    setViewRowCount: function(rowCount) {
        this.__viewRowCountSubject.next(rowCount);
    },
    setViewFocusDate: function(focusDate) {
        this.__viewFocusDateSubject.next(focusDate);
    },
    setCalendar: function(calendar) {
        this.__calendarSubject.next(calendar);
    }
};
window.addEventListener("popstate", e => {
    Tissue.__openedPanelSubject.next(e.state || []);
});
window.addEventListener("load", e => {
    window.location.hash = "";
})

Tissue.__monday$ = Tissue.__viewFocusDateSubject.pipe(
    map(date => Date.parse(date)),
    filter(date => !isNaN(date)),
    map(dateTime => mondayOfDate(dateTime)),
    distinctUntilChanged()
);
Tissue.__loadedCalendar$ = Tissue.__calendarSubject.pipe(
    filter(calendar => !!calendar)
);
Tissue.__spinningWheel$ = Tissue.__calendarSubject.pipe(
    filter(calendar => !calendar),
    mapTo({ loading: true })
);

function nextDateTime(dateTime) {
    let currentDay = new Date(dateTime).getDay();
    while(new Date(dateTime).getDay() === currentDay)
        dateTime += 1000 * 60 * 60 * 24;
    return dateTime;
}

function mondayOfDate(dateTime) {
    while(new Date(dateTime).getDay() !== 1)
        dateTime -= 1000 * 60 * 60 * 12;
    return dateTime;
}

function dateTimeToString(dateTime) {
    let date = new Date(dateTime);
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();

    return year + '-' + (
            month < 10 ? '0' : ''
        ) + month + '-' + (
            day < 10 ? '0' : ''
        ) + day;
}

const Calendar = {
    view: {},
    newEvents: [],
    userCursor: 0
};
Calendar.deleteEvent = function([strDate, strTime]) {
    let view = this.view;
    if(view[strDate]) {
        delete view[strDate][strTime];
        if(Object.keys(view[strDate]).length === 0) {
            delete view[strDate];
        }
    }
}
Calendar.createEvent = function([strDate, strTime], { description, time }) {
    let view = this.view;
    if(! view[strDate]) {
        view[strDate] = {};
    }
    view[strDate][strTime] = { description };
    
    if(time && time > this.userCursor) {
        this.newEvents.push({ time, strDate, strTime })
        view[strDate][strTime].unread = true;
    }
}
Calendar.patchCursor = function(cursor) {
    if(! isNaN(cursor)) {
        this.userCursor = Math.max(this.userCursor, cursor);
        
        let toClean = this.newEvents.filter(({ time }) => time <= this.userCursor);
        let toKeep = this.newEvents.filter(({ time }) => time > this.userCursor);
        
        for(let {strDate, strTime} of toClean) {
            if(this.view[strDate] && this.view[strDate][strTime]) {
                delete this.view[strDate][strTime].unread;
            }
        }
        this.newEvents = toKeep;
    }
}
Calendar.flush = function(consumer) {
    consumer({
        view: this.view
    });
}

function eventV1Handle({ kind, strDate, strDescription, strTime, userInitiator, cursor }, time, currentUser) {
    if(kind === 'cursor_move') {
        if(userInitiator && userInitiator === currentUser) {
            Calendar.patchCursor(parseInt(cursor));
        }
    } else {
        let jsDayDate = Date.parse(strDate);
        if(isNaN(jsDayDate)) return;
        if(kind === 'create') {
            let reportTime = undefined;
            if(userInitiator && userInitiator !== currentUser) {
                reportTime = time;
            }
            
            Calendar.createEvent([strDate, strTime], { description: strDescription, time: reportTime });
        } else if (kind === 'cancel') {
            Calendar.deleteEvent([strDate, strTime]);
        }
    }
}

function eventV2Handle({ toCancel, toCreate, userInitiator }, time, currentUser) {
    {// Check date of toCancel
        let { strDate } = toCancel;
        let jsDayDate = Date.parse(strDate);
        if(isNaN(jsDayDate)) return;
    }
    {// Check date of toCreate
        let { strDate } = toCreate;
        let jsDayDate = Date.parse(strDate);
        if(isNaN(jsDayDate)) return;
    }
    
    eventV1Handle(toCancel, time, currentUser);
    eventV1Handle(toCreate, time, currentUser);
}

function Task(fromTime, lazyContentSupplier, options={}) {
    let { newEvent, password, continueSignal } = options;
    let headers = {
        'Accept': 'application/json',
        'X-Csrf-Token': window['__csrfToken'],
        'Content-Type': 'application/json'
    }
    if(password) {
        headers['Authentication'] = btoa(password)
    }
    let method = 'GET';
    let body = undefined;
    if(newEvent) {
        method = "POST";
        body = JSON.stringify(newEvent);
        headers['Content-Type'] = 'application/json';
    }
    
    this.run = function(waitFullTermination) {
        async function processEvents() {
            let lazyContent = lazyContentSupplier();
            if(!lazyContent) return Promise.resolve();
            
            let content = await lazyContent;
            if(!content) return Promise.resolve();
            
            return new Promise(r => {
                let currentUser = window.localStorage.getItem('userName');
                for(let record of content) {
                    if(record) {
                        let [eventData, time] = record;
                        if(time) {
                            if(eventData.version === 1) {
                                eventV1Handle(eventData, time, currentUser);
                            } else if(eventData.version === 2) {
                                eventV2Handle(eventData, time, currentUser);
                            }
                        }
                    }
                }
                r();
            })
        }
        
        async function fetchNext() {
            let response = await fetch('/send_event.php?from=' + fromTime, { method, headers, body });
            let shouldContinue = true;
            if(continueSignal) {
                shouldContinue = await continueSignal(response);
            }
            if(! shouldContinue)
                return {
                    lazyContentSupplier: () => undefined,
                    nextTime: 0
                };
            
            if(parseInt(response.status / 100) !== 2) {
                console.error(response.status);
                if(response.status === 401) {
                    Tissue.setAuthenticationRequired(true);
                } else {
                    throw new Error("Unexpected error during event fetch");
                }
            } else {
                Tissue.setAuthenticationRequired(false);
                return {
                    lazyContentSupplier: () => response.json(),
                    nextTime: parseInt(response.headers.get('x-next-page-time')) || 0
                }
            }
        }
        
        return Promise.all([
            processEvents(),
            fetchNext()
        ]).then(([_1, _2]) => {
            if(!_2) return;
            
            Tissue.__fetchTime = fromTime;
            
            let { lazyContentSupplier, nextTime } = _2;
            let nextPromise = undefined;
            if(nextTime) {
                nextPromise = new Task(nextTime, lazyContentSupplier)
                                    .run(waitFullTermination);
            } else {
                Calendar.flush(({
                    view
                }) => {
                    Tissue.setCalendar(view)
                });
                nextPromise = Promise.resolve();
            }
            if(waitFullTermination) {
                return nextPromise;
            }
        })
    }
}
