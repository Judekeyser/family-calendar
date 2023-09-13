import {
    now,
    glueTemporalKey, unglueTemporalKey,
    validateDateString, validateTimeString
} from './date-utils';

/**
 * ============================================================================
 * ======================================  EVENT STRUCTURES AND VERSIONING  ===
 * ============================================================================
 * 
 * @typedef {{
 *  kind: 'cursor_move',
 *  userInitiator: string | undefined,
 *  cursor: number,
 *  version: 1
 * }} EventV1_CursorMove
* ----------------------------------------------------------------------------
 * 
 * @typedef {{
 *  kind: 'create',
 *  strDate: string,
 *  strTime: string,
 *  strDescription: string,
 *  strDetails: string | undefined,
 *  isDayOff: boolean | undefined,
 *  userInitiator: string | undefined,
 *  version: 1
 * }} EventV1_Create
* ----------------------------------------------------------------------------
 * 
 * @typedef {{
 *  kind: 'cancel',
 *  strDate: string,
 *  strTime: string,
 *  userInitiator: string | undefined,
 *  version: 1
 * }} EventV1_Cancel
 * ----------------------------------------------------------------------------
 * 
 * @typedef {{
 *  toCancel: EventV1_Cancel,
 *  toCreate: EventV1_Create,
 *  version: 2
 * }} EventV2_Modify
 * ----------------------------------------------------------------------------
 * 
 * Summary of all types, through the union `CalendarEvent`.
 * 
 * @typedef {EventV1_CursorMove |
 *               EventV1_Create |
 *               EventV2_Modify |
 *               EventV1_Cancel } CalendarEvent
 * ----------------------------------------------------------------------------
 */


/**
 * ============================================================================
 * =====================================================  CALENDAR EFFECTS  ===
 * ============================================================================
 * 
 * Calendar effects refer to how events (as typed through `CalendarEvent`)
 * 
 * @callback PatchCursorEffect
 * @param {number} cursorCandidate
 * ----------------------------------------------------------------------------
 * 
 * @callback CreateEventEffect
 * @param {TemporalKey} temporalKey - [strDate, strTime]
 * @param {{
 *  description: string,
 *  details: string | undefined,
 *  isDayOff: boolean,
 *  hitTime: number
 * }} details - event details
 * ----------------------------------------------------------------------------
 * 
 * @callback DeleteEventEffect
 * @param {TemporalKey} temporalKey - [strDate, strTime]
 * ----------------------------------------------------------------------------
 * 
 * @typedef {{
 *  patchCursor: PatchCursorEffect,
 *  createEvent: CreateEventEffect,
 *  deleteEvent: DeleteEventEffect
 * }} Calendar
 * 
 * @callback CalendarEffect
 * @param {Calendar} calendar
 * ----------------------------------------------------------------------------
 */


/**
 * @param {EventV1_CursorMove | EventV1_Cancel | EventV1_Create} event
 * @param {number | undefined} hitTime
 * @param {string} [currentUser]
 * @returns {CalendarEffect | undefined} - A side effect on the calendar
 * ----------------------------------------------------------------------------
 */
function eventV1Handle(event, hitTime, currentUser) {
    const { kind, userInitiator } = event;
    if (kind === 'cursor_move') {
        const { cursor } = event;

        if (userInitiator && userInitiator === currentUser) {
            return ({ patchCursor }) => patchCursor(parseInt(String(cursor)));
        } else {
            return undefined;
        }
    } else {
        const date = validateDateString(event.strDate);
        const time = validateTimeString(event.strTime);


        if(!date || !time) {
            return undefined;
        } else {
            if (kind === 'create') {
                const { strDescription, strDetails, isDayOff } = event;
                if (!strDescription) {
                    return undefined;
                } else {
                    const reportTime = (
                        userInitiator && userInitiator !== currentUser
                    ) ? (hitTime || 0) : 0;

                    return ({ createEvent }) => createEvent(
                        { date, time },
                        {
                            description: strDescription,
                            details: strDetails || undefined,
                            isDayOff: isDayOff || false,
                            hitTime: reportTime
                        }
                    );
                }
            } else if (kind === 'cancel') {
                return ({ deleteEvent }) => deleteEvent({ date, time });
            } else {
                return undefined;
            }
        }
    }
}

/**
 * 
 * @param {EventV2_Modify} event 
 * @param {number} time 
 * @param {string} [currentUser] 
 * @returns {CalendarEffect | undefined} - A side effect on the calendar
 *-----------------------------------------------------------------------------
 */
function eventV2Handle(event, time, currentUser) {
    const { toCancel, toCreate } = event;

    const h1 = eventV1Handle(toCancel, time, currentUser);
    const h2 = eventV1Handle(toCreate, time, currentUser);

    if (h1 && h2) {
        return x => { h1(x); h2(x); };
    } else {
        return undefined;
    }
}

/**
 * @param {CalendarEvent | undefined} event 
 * @param {number} time 
 * @param {string} [currentUser] 
 * @returns {CalendarEffect | undefined}
 *-----------------------------------------------------------------------------
 */
function eventHandler(event, time, currentUser) {
    if (event) {
        const { version } = event;
        switch (version) {
            case 1:
                return eventV1Handle(event, time, currentUser);
            case 2:
                return eventV2Handle(event, time, currentUser);
        }
    }
    return undefined;
}

/**
 * Sends messages and fetches information from the remote backend.
 * The policy here is agnostic of everything that relates to the business,
 * but is concerned with correct headers definition and token retrieve.
 * 
 * @typedef {{
 *  from: number,
 *  password: string | undefined,
 *  newEvent: CalendarEvent | undefined
 * }} FetchRoutineArgument
 * 
 * @param {FetchRoutineArgument} _1 
 * @returns {Promise<Response>}
 * ----------------------------------------------------------------------------
 */
async function fetchRoutine(_1) {
    const { from, password, newEvent } = _1;
    const url = '/send_event.php?from=' + String(from);

    /**
     * @type {string | undefined}
     */
    const csrfToken = (
        /**
         * @type{Object.<string,string>}
         */ (
            /**
             * @type{Object}
             */ (window)
        )['__csrfToken']
    );

    /**
     * @type {HeadersInit}
     */
    const headers = { 'Accept': 'application/json' };
    if (csrfToken) { headers['X-Csrf-Token'] = csrfToken; }
    if (password) { headers['Authentication'] = btoa(password); }

    /**
     * @type {Response}
     */
    let response;
    if (newEvent) {
        headers['Content-Type'] = 'application/json';
        response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(newEvent)
        });
    } else {
        response = await fetch(url, {
            method: 'GET',
            headers
        });
    }

    if (response.status !== 200) {
        const authDelay = response.headers.get("X-Authentication-Delay");
        throw {
            errorCode: response.status,
            authenticationDelay: authDelay,
            errorMessage: await response.json()
        };
    } else {
        return response;
    }
}

/**
 * Sends messages and fetches information from the remote backend.
 * Compared to `fetchRoutine`, this method is aware of the business and
 * performs a paginated fetch. It also decrypts events as effects on the
 * calendar, using the `eventHandler` routine.
 * 
 * @callback Continuation
 * @returns {Promise<number | undefined>}
 * 
 * @param {FetchRoutineArgument} x 
 * @param {Calendar} calendar 
 * @returns {Promise<Continuation>}
 * ----------------------------------------------------------------------------
 */
async function sendEvent(x, calendar) {
    /**
     * @param {Iterable<
     *  [CalendarEvent | undefined, number] | undefined
     * >} content
     * @returns {unknown}
     */
    function consumeContent(content) {
        if (content) {
            const currentUser = window.localStorage.getItem('userName');

            const effects = [];
            for (const record of content) {
                if (record) {
                    const [eventData, time] = record;
                    if (time) {
                        const effect = eventHandler(
                            eventData, time, currentUser || undefined
                        );
                        if (effect) {
                            effects.push(effect);
                        }
                    }
                }
            }
            for (const effect of effects) {
                effect(calendar);
            }
        }
        return undefined;
    }

    /**
     * @param {Response} response 
     * @returns {Promise<number | undefined>}
     * ------------------------------------------------------------------------
     */
    async function continuationOf(response) {
        let from;
        for (let responseCursor = response; ;) {
            const nextTime = parseInt(
                responseCursor.headers.get('x-next-page-time') || '0'
            );
            if (!nextTime || !isFinite(nextTime)) {
                consumeContent(await responseCursor.json());
                break;
            } else {
                from = nextTime;
                [responseCursor] = await Promise.all([
                    fetchRoutine({
                        from: nextTime,
                        password: undefined, newEvent: undefined
                    }),
                    responseCursor.json().then(consumeContent)
                ]);
            }
        }
        return from;
    }

    const firstResponse = await fetchRoutine(x);
    return () => continuationOf(firstResponse);
}


class Backend {
    constructor() {
        /**
         * @type {Map<DateString, Map<TimeString, EventData>>}
         */
        this.view = new Map();

        /**
         * @type {Array<{hitTime: number} & TemporalKey>}
         */
        this.newEvents = [];
        this.userCursor = 0;
        this.isBusy = false;
        this.lastUpdateTimestamp = 0;
    }

    #getState() {
        if (!this.authentifiedUser.userName) {
            throw {
                errorMessage: "Utilisateur non identifié",
                errorCode: 403
            };
        }
        return {
            view: this.view,
            newEvents: [
                ... new Set(this.newEvents.map(glueTemporalKey))
            ].map(expression => {
                const { date, time } = unglueTemporalKey(expression);
                return {
                    strDate: date,
                    strTime: time
                };
            })
        };
    }

    /**
     * @param {TemporalKey} _1 
     * ------------------------------------------------------------------------
     */
    #deleteEvent(_1) {
        const { date, time } = _1;

        const timeMap = this.view.get(date);
        if (timeMap) {
            timeMap.delete(time);

            if (!timeMap.size) {
                this.view.delete(date);
            }
        }
    }

    /**
     * @param {TemporalKey} _1
     * @param {{
     *  description: string,
     *  details: string | undefined,
     *  hitTime: number,
     *  isDayOff: boolean
     * }} _2 
     * ------------------------------------------------------------------------
     */
    #createEvent(_1, _2) {
        const { date, time } = _1;
        const { description, details, hitTime, isDayOff } = _2;

        const entry = {
            description, details, isDayOff,
            unread: hitTime && hitTime > this.userCursor ? true : false
        };

        this.view.set(date, (
            this.view.get(date) || new Map()
        ).set(time, entry));

        if (entry.unread) {
            this.newEvents.push({
                hitTime,
                time,
                date
            });
        }
    }

    /**
     * 
     * @callback IsReadPredicate
     * @param {{hitTime: number | undefined, date: DateString | undefined}} _
     * @returns {boolean}
     */

    /**
     * @param {IsReadPredicate} isReadPredicate 
     */
    #markEventsAsRead(isReadPredicate) {
        const newEvents = [];

        for (const elem of this.newEvents) {
            const { date, time } = elem;
            const mapEntry = new Map(this.view.get(date)).get(time);
            if(mapEntry) {
                if(isReadPredicate(elem)) {
                    mapEntry.unread = false;
                } else {
                    newEvents.push(elem);
                }
            }
        }
        this.newEvents = newEvents;
    }

    /**
     * @param {number} cursor 
     */
    #patchCursor(cursor) {
        if (!isNaN(cursor)) {
            const effectiveCursor = Math.max(this.userCursor, cursor);

            this.#markEventsAsRead(
                ({ hitTime }) => (hitTime || -1) <= effectiveCursor
            );
        }
    }

    /**
     * @param {{
     *  password: string | undefined
     *  newEvent: CalendarEvent | undefined
     * }} _1
     */
    async #update(_1) {
        const { password, newEvent } = _1;
        try {
            if (this.isBusy) {
                return false;
            } else {
                this.isBusy = true;
                try {
                    const continuation = await sendEvent(
                        {
                            password,
                            newEvent,
                            from: this.userCursor
                        }, {
                        patchCursor: this.#patchCursor.bind(this),
                        deleteEvent: this.#deleteEvent.bind(this),
                        createEvent: this.#createEvent.bind(this),
                    }
                    );

                    const nextCursor = await continuation();
                    this.userCursor = nextCursor || this.userCursor;

                    // We clean here the newEvents array,
                    // to filter it only after the batch process
                    const todayDate = now();
                    this.#markEventsAsRead(
                        ({ date }) => (date || '') < todayDate
                    );
                    return true;
                } finally {
                    this.isBusy = false;
                }
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /** Exposed getters */

    get state() {
        return new Promise((res, rej) => {
            const now = Date.now();
            (async () => {
                if (!this._Backend__lastUpdateTimestamp ||
                    this._Backend__lastUpdateTimestamp < now - 30 * 1000
                ) {
                    try {
                        await this.#update({
                            password: undefined,
                            newEvent: undefined
                        });
                        this._Backend__lastUpdateTimestamp = now;
                    } catch (error) {
                        rej(error);
                    }
                }
                try {
                    res(this.#getState());
                } catch (error) {
                    rej(error);
                }
            })();
        });
    }

    get authentifiedUser() {
        return {
            userName: localStorage.getItem('userName') || undefined
        };
    }

    /**
     * 
     * @param {{
     *  password: string | undefined,
     *  userName: string | undefined
     * }} credentials
     * @returns {Promise<boolean>}
     */
    authentify = async credentials => {
        const { password, userName } = credentials;
        if (!userName) {
            localStorage.removeItem('userName');
        } else {
            localStorage.setItem('userName', userName);
        }
        return this.#update({ password, newEvent: undefined });
    };

    /**
     * @param {TemporalKey & {
     *  strDescription: string,
     *  strDetails: string | undefined,
     *  isDayOff: boolean
     * }} appointmentRecord 
     * @returns {Promise<boolean>}
     */
    createEvent = async (appointmentRecord) => {
        const {
            time, date,
            strDescription, strDetails, isDayOff
        } = appointmentRecord;
        /**
         * @type {EventV1_Create}
         */
        const newEvent = {
            strTime: time,
            strDate: date,
            strDescription, strDetails, isDayOff,
            userInitiator: (
                window.localStorage.getItem('userName') || undefined
            ),
            kind: "create",
            version: 1
        };
        return this.#update({ newEvent, password: undefined });
    };

    /**
     * @param {TemporalKey} temporalKey
     * @returns {Promise<boolean>}
     */
    cancelEvent = async (temporalKey) => {
        const { date, time } = temporalKey;
        /**
         * @type {EventV1_Cancel}
         */
        const newEvent = {
            strDate: date,
            strTime: time,
            userInitiator: (
                window.localStorage.getItem('userName') || undefined
            ),
            version: 1,
            kind: "cancel"
        };

        return this.#update({ newEvent, password: undefined });
    };

    /**
     * @param {{
     *  toCreate: TemporalKey & {
     *   strDescription: string,
     *   strDetails: string | undefined,
     *   isDayOff: boolean
     *  },
     *  toCancel: TemporalKey
     * }} modification 
     * @returns {Promise<boolean>}
     */
    editEvent = async (modification) => {
        const { toCancel, toCreate } = modification;
        const userInitiator = (
            window.localStorage.getItem('userName') || undefined
        );

        /**
         * @type {EventV1_Create}
         */
        const createEvent = (({
            date, time,
            strDescription, strDetails, isDayOff
        }) => ({
            strTime: time,
            strDate: date,
            strDescription, strDetails, isDayOff,
            userInitiator,
            version: 1,
            kind: "create"
        }))(toCreate);

        /**
         * @type {EventV1_Cancel}
         */
        const cancelEvent = (({ date, time }) => ({
            strTime: time,
            strDate: date,
            version: 1,
            kind: "cancel",
            userInitiator
        }))(toCancel);

        /**
         * @type {EventV2_Modify}
         */
        const newEvent = {
            toCreate: createEvent,
            toCancel: cancelEvent,
            version: 2
        };

        return this.#update({ newEvent, password: undefined });
    };

    markRead = async () => {
        /**
         * @type {EventV1_CursorMove}
         */
        const newEvent = {
            userInitiator: (
                window.localStorage.getItem('userName') || undefined
            ),
            kind: "cursor_move",
            version: 1,
            cursor: this.userCursor
        };
        return this.#update({ newEvent, password: undefined });
    };
}


const backend = new Backend();

export { backend };
