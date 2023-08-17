import { dateTimeToString } from './date-utils';

/**
 * @typedef {{
 *  kind: 'cursor_move',
 *  userInitiator: string?,
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
 *  userInitiator: string?,
 *  version: 1
 * }} EventV1_Create
* ----------------------------------------------------------------------------
 * 
 * @typedef {{
 *  kind: 'cancel',
 *  strDate: string,
 *  strTime: string,
 *  userInitiator: string?,
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
 * @typedef {EventV1_CursorMove |
 *               EventV1_Create |
 *               EventV2_Modify |
 *               EventV1_Cancel } CalendarEvent
 * ----------------------------------------------------------------------------
 */


/**
 * @callback PatchCursorEffect
 * @param {number} cursorCandidate
 * ----------------------------------------------------------------------------
 * 
 * @callback CreateEventEffect
 * @param {[strDate: string, strTime: string]} temporalKey - [strDate, strTime]
 * @param {{ description: string, time: number }} details - event details
 * ----------------------------------------------------------------------------
 * 
 * @callback DeleteEventEffect
 * @param {[string, string]} temporalKey - [strDate, strTime]
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
 * @param {number} time
 * @param {string=} currentUser
 * @returns {CalendarEffect=} - A side effect on the calendar
 * ----------------------------------------------------------------------------
 */
function eventV1Handle(event, time, currentUser) {
    const { kind, userInitiator } = event;
    if (kind === 'cursor_move') {
        const { cursor } = event;

        if (userInitiator && userInitiator === currentUser) {
            return ({ patchCursor }) => patchCursor(parseInt(String(cursor)));
        } else {
            return undefined;
        }
    } else {
        const { strDate, strTime } = event;
        const jsDayDate = Date.parse(strDate);
        if (isNaN(jsDayDate) || !strTime) {
            return undefined;
        } else {
            if (kind === 'create') {
                const { strDescription } = event;
                if (!strDescription) {
                    return undefined;
                } else {
                    const reportTime = (
                        userInitiator && userInitiator !== currentUser
                    ) ? time : 0;

                    return ({ createEvent }) => createEvent(
                        [strDate, strTime],
                        { description: strDescription, time: reportTime }
                    );
                }
            } else if (kind === 'cancel') {
                return ({ deleteEvent }) => deleteEvent([strDate, strTime]);
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
 * @param {string=} currentUser 
 * @returns {CalendarEffect=} - A side effect on the calendar
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
 * @param {CalendarEvent?} event 
 * @param {number} time 
 * @param {string=} currentUser 
 * @returns {CalendarEffect=}
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
     * @type {string=}
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
     * @param {Iterable<[CalendarEvent | null, number]?>} content
     */
    function consumeContent(content) {
        if (!content) {
            return undefined;
        } else {
            const currentUser = window.localStorage.getItem('userName') ||
                undefined;

            /**
             * @type {Array<CalendarEffect>}
             */
            const effects = [];
            for (const record of content) {
                if (record) {
                    const [eventData, time] = record;
                    if (time) {
                        const effect = eventHandler(
                            eventData, time, currentUser
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
    }

    /**
     * @param {Response} response 
     * @returns {Promise<number | undefined>}
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


/** The invariance of this type is to maintain a comprehensive state about the
 * calendar.
 * 
 * @typedef {{
 *  strDate: string,
 *  strTime: string
 * }} TemporalKey
 * 
 * @typedef {{
 *  description: string,
 *  unread?: boolean | undefined
 * }}CalendarTimedRecord
 * ----------------------------------------------------------------------------
 */
class Backend {
    constructor() {
        /**
         * @type {Map<string, Map<string, CalendarTimedRecord>>}
         */
        this.view = new Map();

        /**
         * @type {Array<{time: number} & TemporalKey>}
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
            newEvents: [... new Set(
                [...this.newEvents]
                    .map(({ strTime, strDate }) => (`${strDate} ${strTime}`))
            )].map(expression => {
                const index = expression.indexOf(" ");
                return {
                    strDate: expression.substring(0, index),
                    strTime: expression.substring(index + 1)
                };
            })
        };
    }

    /**
     * @param {[strDate: string, strTime: string]} _1 
     * ------------------------------------------------------------------------
     */
    #deleteEvent(_1) {
        const [strDate, strTime] = _1;

        const timeMap = this.view.get(strDate);
        if (timeMap) {
            timeMap.delete(strTime);

            if (!timeMap.size) {
                this.view.delete(strDate);
            }
        }
    }

    /**
     * @param {[strDate: string, strTime: string]} _1
     * @param {{description: string, time: number}} _2 
     * ------------------------------------------------------------------------
     */
    #createEvent(_1, _2) {
        const [strDate, strTime] = _1;
        const { description, time } = _2;

        const entry = {
            description,
            unread: time && time > this.userCursor ? true : false
        };

        if (!this.view.has(strDate)) {
            this.view.set(strDate, new Map());
        }
        const timeMap = /** @type{Map<string, CalendarTimedRecord>} */ (
            this.view.get(strDate)
        );
        timeMap.set(strTime, entry);

        if (entry.unread) {
            this.newEvents.push({ time, strDate, strTime });
        }
    }

    /**
     * 
     * @callback IsReadPredicate
     * @param {{time: number | undefined, strDate: string | undefined}} _
     * @returns {boolean}
     */

    /**
     * @param {IsReadPredicate} isReadPredicate 
     */
    #markEventsAsRead(isReadPredicate) {
        const newEvents = [];

        for (const elem of this.newEvents) {
            if (isReadPredicate(elem)) {
                const { strDate, strTime } = elem;
                const forDate = this.view.get(strDate);
                const entry = forDate ? forDate.get(strTime) : undefined;

                if (entry) {
                    entry.unread = false;
                }
            } else {
                newEvents.push(elem);
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
                ({ time }) => (time || -1) <= effectiveCursor
            );
        }
    }

    /**
     * @param {{
     *  password?: string | undefined
     *  newEvent?: CalendarEvent | undefined
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
                    const todayDate = dateTimeToString(Date.now());
                    this.#markEventsAsRead(
                        ({ strDate }) => (strDate || '') < todayDate
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
                        await this.#update({});
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
        return this.#update({ password });
    };

    /**
     * @param {TemporalKey & {strDescription: string}} appointmentRecord 
     * @returns {Promise<boolean>}
     */
    createEvent = async (appointmentRecord) => {
        const { strTime, strDate, strDescription } = appointmentRecord;
        /**
         * @type {EventV1_Create}
         */
        const newEvent = {
            strTime, strDate, strDescription,
            userInitiator: window.localStorage.getItem('userName'),
            kind: "create",
            version: 1
        };
        return this.#update({ newEvent });
    };

    /**
     * @param {TemporalKey} temporalKey
     * @returns {Promise<boolean>}
     */
    cancelEvent = async (temporalKey) => {
        const { strDate, strTime } = temporalKey;
        /**
         * @type {EventV1_Cancel}
         */
        const newEvent = {
            strDate, strTime,
            userInitiator: window.localStorage.getItem('userName'),
            version: 1,
            kind: "cancel"
        };

        return this.#update({ newEvent });
    };

    /**
     * @param {{
     *  toCreate: TemporalKey & {strDescription: string},
     *  toCancel: TemporalKey
     * }} modification 
     * @returns 
     */
    editEvent = async (modification) => {
        const { toCancel, toCreate } = modification;
        const userInitiator = window.localStorage.getItem('userName');

        /**
         * @type {EventV1_Create}
         */
        const createEvent = (({ strTime, strDate, strDescription }) => ({
            strTime, strDate, strDescription,
            userInitiator,
            version: 1,
            kind: "create"
        }))(toCreate);

        /**
         * @type {EventV1_Cancel}
         */
        const cancelEvent = (({ strTime, strDate }) => ({
            strTime, strDate,
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

        return this.#update({ newEvent });
    };

    markRead = async () => {
        /**
         * @type {EventV1_CursorMove}
         */
        const newEvent = {
            userInitiator: window.localStorage.getItem('userName'),
            kind: "cursor_move",
            version: 1,
            cursor: this.userCursor
        };
        return this.#update({ newEvent });
    };
}


const backend = new Backend();

export { backend };
