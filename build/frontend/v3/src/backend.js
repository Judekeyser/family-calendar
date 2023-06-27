import { EventEmitter } from './event-emitter'
import { router } from './routing'
import { History } from './_dev_history'
import { dateTimeToString } from './date-utils'


function eventV1Handle(
    { kind, strDate, strDescription, strTime, userInitiator, cursor },
    time, currentUser
) {
    if(kind === 'cursor_move') {
        if(userInitiator && userInitiator === currentUser) {
            return ({ patchCursor }) => patchCursor(parseInt(cursor));
        }
    } else {
        let jsDayDate = Date.parse(strDate);
        if(isNaN(jsDayDate) || !strTime) return;
        if(kind === 'create') {
            let reportTime = undefined;
            if(userInitiator && userInitiator !== currentUser) {
                reportTime = time;
            }
            
            return ({ createEvent }) => createEvent(
                [strDate, strTime],
                { description: strDescription, time: reportTime }
            );
        } else if (kind === 'cancel') {
            return ({ deleteEvent }) => deleteEvent([strDate, strTime]);
        }
    }
}

function eventV2Handle(
    { toCancel, toCreate, userInitiator },
    time, currentUser
) {
    {// Check date of toCancel
        if(! toCancel) return;
        let { strDate, strTime } = toCancel;
        let jsDayDate = Date.parse(strDate);
        if(isNaN(jsDayDate) || !strTime) return;
    }
    {// Check date of toCreate
        if(! toCreate) return;
        let { strDate, strTime } = toCreate;
        let jsDayDate = Date.parse(strDate);
        if(isNaN(jsDayDate) || !strTime) return;
    }
    
    let h1 = eventV1Handle(toCancel, time, currentUser);
    let h2 = eventV1Handle(toCreate, time, currentUser);
    
    return x => {
        h1(x);
        h2(x);
    }
}

async function fetchRoutine({ from, password, newEvent }) {
    let headers = {
        'Accept': 'application/json',
        'X-Csrf-Token': window['__csrfToken']
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
    let url = '/send_event.php?from=' + parseInt(from);
    
    let response = await fetch(url, { method, headers, body });
    if(response.status !== 200) {
        throw {
            errorCode: response.status,
            authenticationDelay: response.headers.get("X-Authentication-Delay"),
            errorMessage: await response.json()
        }
    } else return response;
}

function sendEvent(x, calendar) {
    function consumeContent(content) {
        if(!content) return;
        let currentUser = window.localStorage.getItem('userName');
        
        let effects = []
        for(let record of content) if(record) {
            let [eventData, time] = record;
            if(time) {
                let effect = undefined;
                if(eventData.version === 1) {
                    effect = eventV1Handle(eventData, time, currentUser);
                } else if(eventData.version === 2) {
                    effect = eventV2Handle(eventData, time, currentUser);
                }
                if(effect) {
                    effects.push(effect)
                }
            }
        }
        for(let effect of effects) effect(calendar)
    }
    
    async function continuationOf(response) {
        let from, nextTime;
        for(;;) {
            nextTime = response.headers.get('x-next-page-time') || 0;
            if(! nextTime) {
                consumeContent(await response.json());
                return from;
            } else {
                from = nextTime;
                [response] = await Promise.all([
                    fetchRoutine({ from }),
                    response.json().then(consumeContent)
                ])
            }
        }
    }
    
    return fetchRoutine(x).then(_ => () => continuationOf(_))
}

function Backend() 
{
    /**
    The invariance of this type is to maintain
    a comprehensive state about the calendar.
    */
    EventEmitter.call(this, Backend._EventEmitter__Backend)
    this._Backend__view = new Map()
    this._Backend__newEvents = new Set()
    this._Backend__userCursor = 0
    this._Backend__isBusy = false
    this._Backend__authenticationDelay = 0
    
    this._Backend__lastUpdateTimestamp = 0
    this._Backend__lastInError = false;
}
Backend._EventEmitter__Backend = {
    channel: "app-calendar"
}
Backend.prototype =
{
    _Backend__getState: function() {
        return {
            view: this._Backend__view,
            newEvents: [... new Set(
                [...this._Backend__newEvents]
                .map(({ strTime, strDate }) => (`${strDate} ${strTime}`))
            )].map(expression => {
                let index = expression.indexOf(" ");
                return {
                    strDate: expression.substring(0, index),
                    strTime: expression.substring(index+1)
                }
            }),
            authenticationDelay: this._Backend__authenticationDelay,
            markRead: this.markRead,
            createEvent: this.createEvent,
            editEvent: this.editEvent,
            cancelEvent: this.cancelEvent
        }
    },
    
    _Backend__deleteEvent: function([strDate, strTime]) {
        let view = this._Backend__view;
        
        if(view.has(strDate)) {
            let dateView = view.get(strDate)
            if(dateView.has(strTime)) {
                dateView.delete(strTime)
            }
            if(dateView.size === 0) {
                view.delete(strDate)
            }
        }
    },
    
    _Backend__createEvent: function([strDate, strTime], {description, time}) {
        let userCursor = this._Backend__userCursor;
        let view = this._Backend__view;
        let newEvents = this._Backend__newEvents;
        
        let entry = {
            description,
            unread: time && time > userCursor
        }
        
        if(!view.has(strDate))
            view.set(strDate, new Map())
        view = view.get(strDate);
        view.set(strTime, entry)
        
        if(entry.unread) {
            newEvents.add({ time, strDate, strTime })
        }
    },
    
    _Backend__markEventsAsRead: function(isReadPredicate) {
        let newEvents = this._Backend__newEvents;
        let view = this._Backend__view;
        for(let elem of newEvents) {
            if(isReadPredicate(elem)) {
                let { strDate, strTime } = elem
                let forDate = view.get(strDate)
                let entry = forDate ? forDate.get(strTime) : undefined;
                
                if(entry) {
                    entry.unread = false;
                }
                newEvents.delete(elem)
            }
        }
    },
    
    _Backend__patchCursor: function(cursor) {
        if(!isNaN(cursor)) {
            //let newEvents = this._Backend__newEvents;
            let view = this._Backend__view;
            cursor = Math.max(this._Backend__userCursor, cursor)
            
            this._Backend__markEventsAsRead(
                elem => elem.time <= cursor
            )
        }
    },
    
    _Backend__checkIfAppointmentBelongsToView: function({ strTime, strDate }) {
        let view = this._Backend__view;
        let belongsToTheView = view.has(strDate) && view.get(strDate).has(strTime);
        return belongsToTheView;
    },
    
    /** Exposed getters */
    
    get state() {
        if(!this._Backend__lastInError) {
            let now = Date.now();
            if(!this._Backend__lastUpdateTimestamp || this._Backend__lastUpdateTimestamp < now - 30*1000) {
                this.update({}).then(noError => {
                    if(noError) {
                        this._Backend__lastUpdateTimestamp = now
                    }
                })
            }
        }
        if(!this._Backend__state)
            this._Backend__state = this._Backend__getState()
        return this._Backend__state
    },
    
    get update() {
        return (async function({ password, newEvent }, onFailure) {
            try {
                if(this._Backend__isBusy) return false;
                
                this._Backend__isBusy = true;
                try {                
                    try {
                        var continuation = await sendEvent(
                            {
                                password,
                                newEvent,
                                from: this._Backend__userCursor
                            },
                            new History({
                                deleteEvent: this._Backend__deleteEvent.bind(this),
                                createEvent: this._Backend__createEvent.bind(this),
                                patchCursor: this._Backend__patchCursor.bind(this)
                            })
                        );
                        this._Backend__lastInError = false;
                    } catch(error) {
                        let { errorCode, errorMessage, authenticationDelay } = error;
                        this._Backend__authenticationDelay = !authenticationDelay ? 0 : parseInt(authenticationDelay);
                        if(errorCode === 401 || errorCode === 403) {
                            this._Backend__lastInError = true;
                            let canRedirect = router.goTo(["authentication"])
                            if(!canRedirect) {
                                if(onFailure)
                                    onFailure(error)
                            }
                        } else {
                            if(onFailure)
                                onFailure(error);
                        }
                        return false;
                    }
                    
                    let nextCursor = await continuation()
                    this._Backend__userCursor = nextCursor || this._Backend__userCursor
                    
                    // We clean here the newEvents array, to filter it only after the batch process
                    const todayDate = dateTimeToString(Date.now());
                    this._Backend__markEventsAsRead(
                        elem => elem.strDate < todayDate
                    )                    
                    return true;
                } finally {
                    this._Backend__isBusy = false;
                    this._Backend__state = this._Backend__getState()
                    this._emitEvents()
                }
            } catch(error) {
                console.error(error)
            }
        }).bind(this)
    },
    
    get createEvent() {
        return (async function({ strTime, strDate, strDescription, strTimeRange }) {
            let newEvent = {
                strTime, strDate, strDescription, strTimeRange,
                userInitiator: window.localStorage.getItem('userName'),
                kind: "create",
                version: 1
            }
            return this.update({ newEvent })
        }).bind(this);
    },
    
    get cancelEvent() {
        return (async function({ strDate, strTime }) {
            let newEvent = {
                strDate, strTime,
                userInitiator: window.localStorage.getItem('userName'),
                version: 1,
                kind: "cancel"
            }
            
            return this.update({ newEvent })
        }).bind(this)
    },
    
    get editEvent() {
        return (async function({ toCancel, toCreate }) {
            let userInitiator = window.localStorage.getItem('userName');
            
            toCreate = (({ strTime, strDate, strDescription }) => ({
                strTime, strDate, strDescription,
                userInitiator,
                version: 1,
                kind: "create"
            }))(toCreate);
            
            toCancel = (({ strTime, strDate }) => ({
                strTime, strDate,
                version: 1,
                kind: "cancel",
                userInitiator
            }))(toCancel);
            
            let newEvent = {
                toCreate, toCancel,
                userInitiator,
                version: 2
            };
            
            return this.update({ newEvent })
        }).bind(this)
    },
    
    get markRead() {
        return (async function() {
            let newEvent = {
                userInitiator: window.localStorage.getItem('userName'),
                kind: "cursor_move",
                version: 1,
                cursor: this._Backend__userCursor
            }
            return this.update({ newEvent })
        }).bind(this)
    }
}
Object.setPrototypeOf(Backend.prototype, EventEmitter.prototype)


const backend = new Backend();

export { backend }