// #!if test
function equals(a,b) {
    if(a instanceof Map && b instanceof Map) {
        return mapEquals(a,b);
    } else {
        if(typeof(a) === typeof({})) {
            return mapEquals(
                new Map(Object.entries(a)),
                new Map(Object.entries(b))
            );
        } else if(typeof(a) === typeof(0)) {
            return isNaN(a) ? isNaN(b) : a === b;
        } else return a === b;
    }
}
function mapEquals(a,b) {
    routine: {
        if(a.size !== b.size) break routine;
        for(const key of a.keys()) {
            if(!b.has(key)) break routine;
            if(!equals(a.get(key), b.get(key))) break routine;
        }
        return true;
    }
    return false;
}
let _TEST_CHAIN_ = Promise.resolve();
function test(name, code) {
    _TEST_CHAIN_ = _TEST_CHAIN_.then(() => {
        console.log("** Test **", name);
        try {
            const [expected, actual, message] = code();
            if(!equals(expected, actual)) {
                console.error("\tTest failed:", name);
                if(message) console.log("\t", message);
                console.log("\tExpected/Actual:", expected, actual);
            }
        } catch(error) {
            console.error("\tTest failed:", error);
        }
    })
}
// #!endif

let Messenger = new Map();
let busy = false;
function runLoop() {
    if(!busy) {
        busy = true;
        setTimeout(() => {
            const messenger = new Map(Messenger);
            Messenger = new Map();
            for(const [channel, messages] of messenger.entries()) {
                for(const detail of messages) {
                    dispatchEvent(new CustomEvent(channel, { detail }))
                }
            }
            if(Messenger.size) {
                setTimeout(runLoop);
            }
            busy = false;
        });
    }
}
function sendMessage(channel, detail) {
    const values = Messenger.get(channel);
    if(!values) {
        Messenger.set(channel, [detail]);
    } else {
        values.push(detail);
    }
    runLoop();
}


/**************************** APP INITIALIZATION *****************************/
const DAY_MAX_TABLE_NONLEAP = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAY_MAX_TABLE_LEAP = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const CYCLE_SIZE = 365*4+1;
function normalizeDate(strDate) {
    // Compte days since January 01 2001.
    // Truncate the date between 2001 and 2099
    strDate = strDate || "";
    const unsafeYear = parseInt(strDate.substring(0, 4));
    const unsafeMonth = parseInt(strDate.substring(5, 7));
    const unsafeDay = parseInt(strDate.substring(8, 10));

    if(isFinite(unsafeYear) && isFinite(unsafeMonth) && isFinite(unsafeDay)) {
        const realYear = Math.max(Math.min(unsafeYear, 2099), 2001);
        const table = realYear % 4 ? DAY_MAX_TABLE_NONLEAP : DAY_MAX_TABLE_LEAP;

        const year = realYear - 2001;
        const month = Math.max(Math.min(unsafeMonth, 12), 1);
        const day = Math.max(Math.min(unsafeDay, table[month]), 1);

        let cumulMonthDays = 0;
        for(let i = 0; i < month; i++)
            cumulMonthDays += table[i];

        return day + cumulMonthDays + parseInt(year/4)*CYCLE_SIZE + ((year)%4)*365 - 1;
    } else {
        return NaN;
    }
}
// #!if test
test("normalizedDate: Correct number of days to 2001-01-01", () => {
    const date = "2001-01-01"
    return [0, normalizeDate(date)];
});
test("normalizedDate: Correct number of days to 2019-03-17", () => {
    const date = "2019-03-17"
    return [6649, normalizeDate(date)];
});
test("normalizedDate: Correct number of days to 2020-03-17", () => {
    const date = "2020-03-17";
    return [7015, normalizeDate(date)];
});
test("normalizedDate: Correct number of days to 2023-12-31", () => {
    const date = "2023-12-31";
    return [8399, normalizeDate(date)];
});
test("normalizedDate: January 2019 contains 31 days", () => {
    const dateStart = "2019-01-01"
    const dateEnd = "2019-02-01";
    return [31, normalizeDate(dateEnd) - normalizeDate(dateStart)];
});
test("normalizedDate: 46 days between January 01 2019 and Feb 15", () => {
    const dateStart = "2019-01-01"
    const dateEnd = "2019-02-16";
    return [46, normalizeDate(dateEnd) - normalizeDate(dateStart)];
});
test("normalizedDate: Non leap year contains 365 days", () => {
    const dateStart = "2019-01-01"
    const dateEnd = "2020-01-01";
    return [365, normalizeDate(dateEnd) - normalizeDate(dateStart)];
});
test("normalizedDate: Non leap year contains 365 days, starting somewhere in year", () => {
    const dateStart = "2019-01-16"
    const dateEnd = "2020-01-16";
    return [365, normalizeDate(dateEnd) - normalizeDate(dateStart)];
});
test("normalizedDate: Non leap year contains 366 days", () => {
    const dateStart = "2020-01-01"
    const dateEnd = "2021-01-01";
    return [366, normalizeDate(dateEnd) - normalizeDate(dateStart)];
});
test("normalizedDate: Non leap year contains 366 days, starting somewhere in year", () => {
    const dateStart = "2020-01-16"
    const dateEnd = "2021-01-16";
    return [366, normalizeDate(dateEnd) - normalizeDate(dateStart)];
});
test("normalizeDate returns `NaN` for invalid date", () => {
    const date = normalizeDate("oops");
    return [NaN, date];
});
test("normalizeDate returns `NaN` for invalid year, valid remainer", () => {
    const date = normalizeDate("oo-03-09");
    return [NaN, date];
});
test("normalizeDate returns `NaN` for invalid month, valid remainer", () => {
    const date = normalizeDate("2023-lol-09");
    return [NaN, date];
});
test("normalizeDate returns `NaN` for invalid day, valid remainer", () => {
    const date = normalizeDate("2023-12-");
    return [NaN, date];
});
test("normalizeDate truncates for out of bounds data", () => {
    const date = normalizeDate("3000-02-30");
    return [normalizeDate("2099-02-28"), date];
});
test("normalizeDate converts 2022-12-31 one before 2023-01-01", () => {
    const initialYear = "2022-12-31";
    const date = normalizeDate(initialYear);

    const expected = normalizeDate("2023-01-01") - 1;

    return [expected, date]
});
// #!endif

function spreadDate(date) {
    if(isFinite(date)) {
        const cyclesBefore = parseInt(date / CYCLE_SIZE);
    
        date = date % CYCLE_SIZE; // Reduce the days to the days from the cycle start
    
        const yearsBefore = Math.min(parseInt(date / 365), 3);

        const year = cyclesBefore * 4 + yearsBefore + 2001;
    
        date = date - 365*yearsBefore; // Reduce the days to the numbers of days from inside the year
        const table = yearsBefore === 3 ? DAY_MAX_TABLE_LEAP : DAY_MAX_TABLE_NONLEAP;
    
        let month = 1;
        date += 1;
        while(table[month] < date) {
            date -= table[month];
            month += 1;
        }
    
        return {
            year, month, day: date
        };
    } else {
        return undefined;
    }
}

// #!if test
test("spreadDate spreads 2023-31-12 correctly", () => {
    const date = normalizeDate("2023-12-31");
    return [
        {
            month: 12,
            day: 31,
            year: 2023
        }, spreadDate(date)
    ]
});
// #!endif

function spreadDateToString({ year, month, day }) {
    if(month < 10) month = '0'+month;
    if(day < 10) day = '0'+day;
    return `${year}-${month}-${day}`;
}

function dateToString(date) {
    const spread = spreadDate(date);
    if(spread) {
        return spreadDateToString(spread);
    } else {
        return undefined;
    }
}

// #!if test
test("dateToString converts year correctly", () => {
    const initialYear = "2019-03-17";
    const date = normalizeDate(initialYear);

    return ["2019-03-17", dateToString(date)]
})
test("dateToString converts year correctly given leap year", () => {
    const initialYear = "2024-02-29";
    const date = normalizeDate(initialYear);

    return ["2024-02-29", dateToString(date)]
})
test("dateToString converts 2022-12-31 correctly back and forth", () => {
    const initialYear = "2022-12-31";
    const date = normalizeDate(initialYear);

    return ["2022-12-31", dateToString(date)]
})
test("dateToString converts 2023-12-01 correctly back and forth", () => {
    const initialYear = "2023-12-01";
    const date = normalizeDate(initialYear);

    return ["2023-12-01", dateToString(date)]
})
// #!endif

function normalizedTime(strTime) {
    /**
     * Compte minutes since 00:00.
     * 
     * minutes+60 hours are plug on bytes 3 - ...
     * 
     * 00 is reserved for "fullday",
     * 01 is reserved for "morning",
     * 10 is for the hours in the morning,
     * 10 followed by 12:00 is for "afternoon"
     * 11 is for every hours in the afternoon
     */
    strTime = strTime || "";
    switch(strTime) {
        case "fullday": return 0;
        case "morning": return 1;
        case "afternoon": return 2 + ((60*12) *4);
    }
    const unsafeHour = parseInt(strTime.substring(0, 2));
    const unsafeMinute = parseInt(strTime.substring(3, 5));

    if(isFinite(unsafeHour) && isFinite(unsafeMinute)) {
        const hour = Math.max(Math.min(unsafeHour, 23), 0);
        const minute = Math.max(Math.min(unsafeMinute, 59), 0);

        return ((minute + 60*hour) *4) + ((hour >= 12) ? 3 : 2);
    }
}

// #!if test
test("normalizedTime compares all times in order", () => {
    const times = [
        "fullday",
        "morning",
        "00:00",
        "00:01",
        "01:00",
        "11:59",
        "afternoon",
        "12:00",
        "12:01",
        "17:00",
        "23:59"
    ];

    const normalized = times.map(normalizedTime);

    const comp = (a,b) => a === b ? 0 : (
        a < b ? -1 : 1
    );
    let cumul = 0;

    for(let i = 0; i < times.length - 1; i++) {
        cumul += comp(normalized[i+1], normalized[i]);
    }

    return [times.length - 1, cumul]
});
test("normalizeTime returns `undefined` for invalid data", () => {
    return [undefined, normalizedTime("oops")];
});
test("normalizeTime returns `undefined` for valid hour but invalid minute", () => {
    return [undefined, normalizedTime("12:ooo")]
});
test("normalizeTime returns `undefined` for valid minute but invalid hour", () => {
    return [undefined, normalizedTime("oo:34")];
});
test("normalizeTime truncates when hours are out of bounds", () => {
    return [normalizedTime("23:59"), normalizedTime("24:59")];
});
test("normalizeTime truncates when minutes are out of bounds", () => {
    return [normalizedTime("23:59"), normalizedTime("23:67")];
});
// #!endif


class DateTimeMap {
    constructor() {
        this.data = new Map();
    }

    delete(date, time) {
        if(isFinite(date) && isFinite(time)) {
            const timeView = this.data.get(date);
            if(timeView) {
                timeView.delete(time);
                if(!timeView.size) {
                    this.data.delete(date);
                }
            }
        }
    }

    set(date, time, record) {
        if(isFinite(date) && isFinite(time)) {
            let timeMap = this.data.get(date);
            if(!timeMap) {
                timeMap = new Map();
                this.data.set(date, timeMap);
            }
            timeMap.set(time, record);
            return true;
        }
        return false;
    }

    get(date, time) {
        if(isFinite(date)) {
            const timeMap = this.data.get(date);
            if(timeMap) {
                if(time == null) {
                    return [...timeMap.keys()];
                } else if(isFinite(time)) {
                    return timeMap.get(time);
                }
            }
        }
    }
}
// #!if test
test("DateTimeMap correctly removes time in data", () => {
    const d20200304 = normalizeDate("2020-03-04");
    const d20201228 = normalizeDate("2020-12-28");
    const h1701 = normalizedTime("17:01");
    const h1356 = normalizedTime("13:56");
    const h1200 = normalizedTime("12:00");

    const data = new Map([
        [
            d20200304,
            new Map([
                [h1356, {}],
                [h1200, {}]
            ])
        ],
        [
            d20201228,
            new Map([
                [h1701, {}]
            ])
        ],
    ]);
    const dtmap = new DateTimeMap();
    dtmap.data = data;
    
    dtmap.delete(d20200304, h1200);
    dtmap.delete(d20201228, h1701);

    const expected = new Map([
        [
            d20200304,
            new Map([
                [h1356, {}]
            ])
        ]
    ]);

    return [expected, data];
});
test("DateTimeMap doesn't crash when remove request is invalid", () => {
    const d20201228 = normalizeDate("2020-12-28");
    const h1701 = normalizedTime("17:01");

    const data = new Map([
        [
            d20201228,
            new Map([
                [h1701, {}]
            ])
        ],
    ]);
    const dtmap = new DateTimeMap();
    dtmap.data = data;

    const copy = new Map([
        [
            d20201228,
            new Map([
                [h1701, {}]
            ])
        ],
    ]);
    
    dtmap.delete(33, h1701);
    dtmap.delete(d20201228, 1);

    return [copy, data];
});
test("DateTimeMap creates entries given record", () => {
    const d20200304 = normalizeDate("2020-03-04");
    const d20201228 = normalizeDate("2020-12-28");
    const h1200 = normalizedTime("12:00");
    const h1356 = normalizedTime("13:56");
    const h1701 = normalizedTime("17:01");

    const data = new Map([
        [
            d20200304,
            new Map([
                [h1200, {}]
            ])
        ]
    ]);
    const dtmap = new DateTimeMap();
    dtmap.data = data;

    const expected = new Map([
        [
            d20200304,
            new Map([
                [h1356, {}],
                [h1200, {}]
            ])
        ],
        [
            d20201228,
            new Map([
                [h1701, {}]
            ])
        ],
    ]);

    dtmap.set(d20201228, h1701, {} );
    dtmap.set(d20200304, h1356, {} );

    return [expected, data]
})
// #!endif

class UnreadAppointments {
    constructor() {
        this.dataToCursor = new Map();
        this.referenceCursor = 0;
    }

    push(cursor, data) {
        cursor = parseInt(cursor);
        if(isFinite(cursor)) {
            if(this.referenceCursor < cursor) {
                this.dataToCursor.set(data, cursor);
            }
        }
    }

    patch(cursor) {
        cursor = parseInt(cursor);
        if(isFinite(cursor)) {
            if(this.referenceCursor < cursor) {
                this.referenceCursor = cursor;
                const dataToRemove = [];
                for(const [data, cursor] of this.dataToCursor.entries()) {
                    if(cursor < this.referenceCursor) {
                        dataToRemove.push(data);
                    }
                }
                for(const data of dataToRemove) {
                    this.dataToCursor.delete(data);
                }
            }
        }
    }

    has(entry) {
        return this.dataToCursor.has(entry);
    }

    size() {
        return this.dataToCursor.size;
    }

    [Symbol.iterator] = () => this.dataToCursor.keys();
}
// #!if test
test("UnreadAppointments can push new appointments from same", () => {
    const ur = new UnreadAppointments();

    ur.push(56, "id-45");
    
    const expected = new Map([
        ["id-45", 56]
    ]);
    return [expected, ur.dataToCursor];
});
test("UnreadAppointments: patch remove events before the cursor", () => {
    const ur = new UnreadAppointments("justin");

    ur.push(56, "id-45");
    ur.push(89, "id-46");
    ur.patch(78);
    ur.push(77, "id-47");
    ur.push(78, "id-48");
    
    const expected = new Map([
        ["id-46", 89]
    ]);
    return [expected, ur.dataToCursor];
});
// #!endif

function generateUid() {
    return `${parseInt(1000000*Math.random())}-${Date.now()}`;
}


class Store
{
    constructor() {
        this.reset();
    }

    reset() {
        this.dtmap = new DateTimeMap();
        this.ur = new UnreadAppointments();
        this.words = new Map();
    }
    
    handleRecords(iterator) {
        iterator = [...iterator];
        this.onRecords(iterator[Symbol.iterator]())
        for(const record of iterator) {
            switch (record.kind) {
                case "cancel": {
                    const {strDate, strTime} = record;
                    const date = normalizeDate(strDate);
                    const time = normalizedTime(strTime);
                    this.dtmap.delete(date, time);
                }
                    break;
                case "create": {
                    const {
                        strDate, strTime, isDayOff,
                        fromUser, cursor,
                        strDescription, strDetails
                    } = record;
                    const date = normalizeDate(strDate);
                    const time = normalizedTime(strTime);
                    const data = {isDayOff, strDescription, strDetails, date, time};
                    if (this.dtmap.set(date, time, data)) {
                        if (!fromUser) {
                            this.ur.push(cursor, data);
                        }
                    }
                }
                    break;
                case "cursor_move": {
                    const {cursor} = record;
                    this.ur.patch(cursor);
                }
            }
        }
    }

    get userName() {
        return localStorage.getItem("userName") || "";
    }

    set userName(value) {
        localStorage.setItem("userName", value);
    }

    get today() {
        // Check MDN: Date.now returns a timestamp from epoch.
        // Date constructor from number will agree on this convention.
        // This means that for a belgian user, the iso string might not correspond
        // to today date (because of timezone). We thus extract a local string
        // and recreate the correct datestring.
        const nowDate = new Date(Date.now());
        const localString = nowDate.toLocaleDateString("fr-BE");
        const [day, month, year] = localString.split("/");
        return [year, month, day].join('-');
    }

    get preferredGridSize() {
        return sessionStorage.getItem("preferredGridSize") || 0;
    }

    set preferredGridSize(value) {
        sessionStorage.setItem("preferredGridSize", value);
    }

    get preferredFocusDate() {
        return sessionStorage.getItem("preferredFocusDate") || "";
    }

    set preferredFocusDate(value) {
        sessionStorage.setItem("preferredFocusDate", value);
    }
}


class EventEmitter
{
    constructor(store, { emitStoreChange, communicationError }) {
        this.store = store;
    
        this.from = 0;
        this.lastTime = 0;

        this.pending = false;

        this.graph = {
            emitStoreChange,
            communicationError
        };
        this.renew_uuid();
    }

    renew_uuid() {
        this._uuid = generateUid();
    }
    
    run({ password, userName }) {
        if(!userName) {
            userName = this.store.userName;
            if(!userName) {
                sendMessage(this.graph.communicationError, {
                    errorCode: 401,
                    errorMessage: "Utilisateur non identifié"
                });
                return;
            }
        } else {
            const storedUserName = this.store.userName || "";
            if(storedUserName) {
                if(storedUserName !== userName) {
                    this.store.userName = userName;
                    this.from = 0;
                    this.store.reset();
                }
            } else {
                this.store.userName = userName;
            }
        }

        let currentIterator$ = Promise.resolve(([])[Symbol.iterator]());

        if(!password) {
            const timestamp = Date.now();
            if(timestamp - this.lastTime <= 1000) {
                return;
            }
            if(this.pending) {
                return; /* TODO: We should likely update some etag and invalide the previous request, then re-issue one */
            }
        } else {
            this.renew_uuid();
        }
        const captureUuid = this._uuid;
        this.pending = true;
        (async () => {
            try {
                fetch: {
                    for(let next = this.from;;) {
                        let task$;
                        /* Post-condition:
                            - `task$` contains the next task to fetch, if any
                            - After that step, `password` and `userName` are reset to `undefined`

                            Current object is left unchanged after this block.
                            Store is left unchanged after this block.
                        */
                        {
                            if(next >= this.from) {
                                task$ = fetchBackend({ from: next, password, userInitiator: this.store.userName });
                                password = undefined;
                                userName = undefined;
                            } else {
                                task$ = undefined;
                            }
                        }
                        /* Post-condition:
                            - Consumed `this.currentIterator$` and handled it.
                            - If any error, communicationError:500 is sent, we break `fetch` block

                            Both store and current object are modified by this block.
                            This block is globally guarded by a check on the execution uuid. If there is a mismatch,
                            we immediatly return, without applying the effect of the scope.
                        */
                        {
                            let iterator;
                            try {
                                iterator = await currentIterator$;
                            } catch(error) {
                                console.error(error);
                                sendMessage(this.graph.communicationError, {
                                    errorCode: 500,
                                    errorMessage: "Erreur interne lors de la gestion des événements"
                                });
                                break fetch;
                            }
                            
                            if(this._uuid !== captureUuid) break fetch;
                            this.store.handleRecords(iterator);
                            if(next > this.from) this.from = next;
                            sendMessage(this.graph.emitStoreChange, {});
                        }
                        /* Post-condition:
                            - Wait for the task
                            - Update the states `next` and `currentIterator$` according to the result of the task

                            - If an error occurs, communicationError is issued, with the error details.
                                - The state does not move in that scenario
                                - We break `fetch` block
                            
                            Both store and current object are left unchanged after this block.
                        */
                        if(task$) {
                            try {
                                const [_next, _iterator$] = await task$;
                                next = _next;
                                currentIterator$ = _iterator$;
                            } catch(error) {
                                const { errorCode, errorMessage } = error;
                                if(errorCode) {
                                    sendMessage(this.graph.communicationError, {
                                        errorCode, errorMessage
                                    });
                                } else {
                                    console.error(error);
                                    sendMessage(this.graph.communicationError, {
                                        errorCode: 500,
                                        errorMessage: "Erreur de communication avec le serveur"
                                    });
                                }
                                break fetch;
                            }
                        }
                        if(next <= this.from) break;
                    }
                    /* If we haven't break the fetch, everything went fine. We schedule a next trigger in 60 seconds */
                    setTimeout(() => void this.run({}), 60*1000);
                }
                this.lastTime = Date.now();
            } finally {
                this.pending = false;
            }
        })();
    }
}


addEventListener("load", async function() {
    const store = new Store();

    const ee = new EventEmitter(store, {
        emitStoreChange: "app-store-change",
        communicationError: "app-communication-error"
    });
    
    {
        const wasmMemory = new WebAssembly.Memory({'initial': 5});
        const memoryBuffer = new Uint8Array(wasmMemory.buffer);
        
        const request = await fetch('app.wasm', { headers: {
            "Accept": "application/wasm"
        }});
        const wasmProgram = await WebAssembly.instantiateStreaming(request, {
            env: {
                memory: wasmMemory,
                js_debug: function(pointer, size) {
                    const slice = memoryBuffer.slice(pointer, pointer+size);
                    const string = new TextDecoder().decode(slice);
                    console.log(string);
                },
                js_debug_number: function(x) {
                    console.warn(String(x));
                },
                js_scope_open: function() {
                    return Scope.CURRENT_SCOPE.openScope()
                },
                js_scope_close: function(id) {
                    Scope.CURRENT_SCOPE.closeScope(id)
                },
                js_scope_push_string: function(pointer, size) {
                    const slice = memoryBuffer.slice(pointer, pointer+size);
                    const string = new TextDecoder().decode(slice);
                    return Scope.CURRENT_SCOPE.push(string);
                },
                js_scoped_element_by_selector: function(pointer, size, parent) {
                    const slice = memoryBuffer.slice(pointer, pointer+size);
                    const cssSelector = new TextDecoder().decode(slice);
                    parent = parent ? Scope.CURRENT_SCOPE.get(parent) : document;
                    const elem = parent.querySelector(cssSelector);
                    if(!elem) {
                        throw new WebAssembly.RuntimeError(`No element for selector ${cssSelector} given parent ${parent}`)
                    } else return Scope.CURRENT_SCOPE.push(elem);
                },
                js_scoped_append_child: function(parent, child) {
                    parent = parent ? Scope.CURRENT_SCOPE.get(parent) : document;
                    child = Scope.CURRENT_SCOPE.get(child);
                    parent.appendChild(child);
                },
                js_scoped_template_content: function(template) {
                    template = Scope.CURRENT_SCOPE.get(template);
                    const child = template.content.cloneNode(true);
                    return Scope.CURRENT_SCOPE.push(child);
                },
                js_scoped_create_element: function(tagName, tagNameSize) {
                    tagName = new TextDecoder().decode(memoryBuffer.slice(tagName, tagName+tagNameSize));
                    return Scope.CURRENT_SCOPE.push(document.createElement(tagName));
                },
                js_scoped_element_set_attribute: function(elem, attr, attrSize, value, valueSize) {
                    attr = new TextDecoder().decode(memoryBuffer.slice(attr, attr+attrSize));
                    value = new TextDecoder().decode(memoryBuffer.slice(value, value+attrSize));
                    elem = Scope.CURRENT_SCOPE.get(elem);
                    if(!elem) {
                        throw new WebAssembly.RuntimeError(`Undefined element for setAttribute(${attr}, ${value})`)
                    } else {
                        elem.setAttribute(attr, value);
                    }
                },
                js_scoped_element_remove_attribute: function(elem, attr, attrSize) {
                    attr = new TextDecoder().decode(memoryBuffer.slice(attr, attr+attrSize));
                    elem = Scope.CURRENT_SCOPE.get(elem);
                    if(!elem) {
                        throw new WebAssembly.RuntimeError(`Undefined element for removeAttribute(${attr})`)
                    } else {
                        elem.removeAttribute(attr);
                    }
                },
                js_scoped_element_text_content: function(elem, text, textSize) {
                    text = new TextDecoder().decode(memoryBuffer.slice(text, text+textSize));
                    elem = Scope.CURRENT_SCOPE.get(elem);
                    if(!elem) {
                        throw new WebAssembly.RuntimeError(`Undefined element for textContent="${text}"`)
                    } else {
                        elem.textContent = text;
                    }
                },
                js_scoped_element_clean: function(elem) {
                    elem = Scope.CURRENT_SCOPE.get(elem);
                    if(!elem) {
                        throw new WebAssembly.RuntimeError(`Cannot reset element`);
                    } else {
                        elem.innerHTML = "";
                    }
                },
                js_scoped_set_event_listener: function(elem, channel, channelSize, data, dataSize) {
                    channel = new TextDecoder().decode(memoryBuffer.slice(channel, channel+channelSize));
                    elem = Scope.CURRENT_SCOPE.get(elem);
                    if(!elem) {
                        throw new WebAssembly.RuntimeError(`Undefined element for textContent="${text}"`)
                    } else {
                        const chunk = memoryBuffer.slice(data, data+dataSize);
                        elem[`on${channel}`] = () => {
                            const start = wasmProgram.instance.exports._start;
                            const heapBase = wasmProgram.instance.exports.__heap_base;

                            memoryBuffer.set(chunk, heapBase);
                            const error = start(heapBase, chunk.length, memoryBuffer.length - heapBase);
                            if(error) {
                                console.error("Error occured", error);
                            }
                        }
                    }
                },
                js_scoped_object_get_as_string: function(objectId, fieldIndex, startCursor, maxLength) {
                    let value = "";
                    try {
                        const object = Scope.CURRENT_SCOPE.get(objectId);
                        const field = object[fieldIndex];
                        value = String(field || "");
                    } catch(error) {
                        console.error(error);
                    }
                    const valueBytes = new TextEncoder().encode(value).slice(0, maxLength);
                    const length = valueBytes.length;
                    memoryBuffer.set(valueBytes, startCursor);
                    return length;
                },
                js_scoped_object_get_as_string_reference: function(objectId, fieldIndex) {
                    let value = "";
                    try {
                        const object = Scope.CURRENT_SCOPE.get(objectId);
                        const field = object[fieldIndex];
                        value = String(field || "");
                    } catch(error) {
                        console.error(error);
                    }
                    return Scope.CURRENT_SCOPE.push(value);
                },
                js_scoped_object_get_as_boolean: function(objectId, fieldIndex) {
                    let value = false;
                    try {
                        const object = Scope.CURRENT_SCOPE.get(objectId);
                        const field = object[fieldIndex];
                        value = !!field;
                    } catch(error) {
                        console.error(error);
                    }
                    return value ? 1 : 0;
                },
                js_scoped_object_get_as_long: function(objectId, fieldIndex) {
                    /*
                     * In practice, the milliseconds associated to 2099-01-01 is
                     *      4070908800000
                     * while safe upper bound is 2^53-1, thus
                     *      9007199254740991
                     * So we should be fine here, we do not actually need the full 64 bits power.
                     */
                    let value = 0;
                    try {
                        const object = Scope.CURRENT_SCOPE.get(objectId);
                        const field = object[fieldIndex];
                        const numericField = parseInt(field);
                        if(isFinite(numericField)) {
                            const safeUpperBound = parseInt(Math.pow(2, 52)); // Actually 2^53-1
                            value = Math.abs(numericField) > safeUpperBound ? safeUpperBound : numericField;
                        }
                    } catch(error) {
                        console.error(error);
                    }
                    return BigInt(value); // because C expects 64 bits
                }
            }
        });
        
        const start = wasmProgram.instance.exports._start;
        const heapBase = wasmProgram.instance.exports.__heap_base;

        function call(url, heapWriter) {
            const totalAvailableSize = memoryBuffer.length - heapBase;
            const urlBytes = new TextEncoder().encode(url.substring(0, parseInt(totalAvailableSize/4)));
            const sizeAfterUrlWriting = totalAvailableSize - urlBytes.length;
            memoryBuffer.set(urlBytes, heapBase);
            for(;;) {
                const shouldContinue = heapWriter(
                    memoryBuffer.subarray(heapBase+urlBytes.length, memoryBuffer.length)
                );
                const scopeIndex = Scope.CURRENT_SCOPE.openScope();
                try {
                    start(heapBase, urlBytes.length);
                } finally {
                    Scope.CURRENT_SCOPE.closeScope(scopeIndex);
                }
                if(!shouldContinue) {
                    break;
                }
            }
        }

        store.onRecords = recordIterator => call("%2F=new_records", memoryBuffer => {
            let cursor = 0;
            for(;;) {
                if(cursor + 2*2 > memoryBuffer.length) {
                    break;
                }
                const next = recordIterator.next();
                if(next.done) {
                    break;
                }
                const record = next.value;
                const flattened = [
                    record.kind,
                    record.cursor,
                    record.fromUser,
                    record.strDate,
                    record.strTime,
                    record.isDayOff,
                    record.strDescription,
                    record.strDetails
                ]
                let recordIndex = Scope.CURRENT_SCOPE.push(flattened);
                memoryBuffer[cursor++] = recordIndex % (1 << 8); recordIndex >>>= 8;
                memoryBuffer[cursor++] = recordIndex % (1 << 8); recordIndex >>>= 8;
            }
            memoryBuffer[cursor++] = 0;
            memoryBuffer[cursor++] = 0;

            return cursor !== 2;
        });
        {
            const url = location.hash.substring(1);
            call(url, () => undefined);
        }
    }

    //addEventListener("popstate", e => void app.onPopstate(e.state));

    //app.historyChange(null, true); // Required to trigger history detection
    ee.run({});
    ee.run({});
    this.setTimeout(() => ee.run({}), 400);
    this.setTimeout(() => ee.run({}), 800);
    this.setTimeout(() => ee.run({}), 1200);

});


class Scope
{
    static CURRENT_SCOPE = new Scope();

    constructor() {
        this.__references = [];
        this.__blocks = [];
    }

    push(object) {
        this.__references.push(object);
        return this.__references.length;
    }

    openScope() {
        return 1;
    }

    closeScope(index) {
        this.__references.splice(0);
        console.log(this);
    }

    get(idx) {
        return this.__references[idx - 1];
    }
}

class Application
{
    constructor(eventEmitter) {
        this._eventEmitter = eventEmitter;
    }

    navigate(url) {
        const strUrl = url.toString();
        b1: {
            try {
                if(history.state.get("/") === url.get("/")) {
                    history.replaceState(new Map(url), '', '#'+strUrl);
                    break b1;
                }
            } catch(error) {}
            history.pushState(new Map(url), '', '#'+strUrl);
        }
    }

    /**
     * Listener for the popstate global event.
     */
    onPopstate = (strState) => {
        let url;
        try {
            url = new URLSearchParams(
                strState == null ? location.hash.substring(1) : strState
            );
        } catch(error) {
            url = new URLSearchParams();
        }
        this.navigate(url);
    }
}