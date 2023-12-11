function eventV1Handle(event, time, userInitiator) {
    const { kind } = event;
    if (kind === 'cursor_move') {
        if(userInitiator && event.userInitiator === userInitiator) {
            return {
                kind,
                cursor: event.cursor
            };
        }
    } else {
        const { strDate, strTime } = event;

        if (kind === 'create') {
            const { strDescription, strDetails, isDayOff } = event;

            return {
                kind,
                strDate,
                strTime,
                isDayOff,
                cursor: time,
                fromUser: userInitiator && (event.userInitiator === userInitiator),
                strDescription,
                strDetails
            };
        } else if (kind === 'cancel') {
            return {
                kind,
                strDate,
                strTime
            };
        }
    }
}

function eventV2Handle(event, time, userInitiator) {
    const { toCancel, toCreate } = event;

    const h1 = eventV1Handle(toCancel, time, userInitiator);
    const h2 = eventV1Handle(toCreate, time, userInitiator);

    return h1 && h2 ? [h1, h2] : [];
}

function write(event, userInitiator) {
    switch(event.kind) {
        case "cancel": return {
            kind: event.kind,
            version: 1,
            strDate: event.strDate,
            strTime: event.strTime
        };
        case "create": return {
            kind: event.kind,
            version: 1,
            strDate: event.strDate,
            strTime: event.strTime,
            isDayOff: event.isDayOff,
            strDescription: event.strDescription,
            strDetails: event.strDetails,
            userInitiator
        };
        case "update": return {
            kind: event.kind,
            version: 2,
            toCancel: {
                strDate: event.cancel_strDate,
                strTime: event.cancel_strTime,
            },
            toCreate: {
                strDate: event.strDate,
                strTime: event.strTime,
                isDayOff: event.isDayOff,
                strDescription: event.strDescription,
                strDetails: event.strDetails
            }
        };
        case "cursor_move": return {
            kind: event.kind,
            version: 1,
            userInitiator,
            cursor: event.cursor
        };
    }
}

function fetchBackend({ from, password, userInitiator, newEvent }) {
    const url = `/send_event.php?from=${parseInt(from)}`;
    const csrfToken = window['__csrfToken'] || "";

    const headers = { 'Accept': 'application/json' };
    if (csrfToken) { headers['X-Csrf-Token'] = csrfToken; }
    if (password) { headers['Authentication'] = btoa(password); }

    let response$;
    if (newEvent) {
        headers['Content-Type'] = 'application/json';
        response$ = fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(write(newEvent))
        });
    } else {
        response$ = fetch(url, {
            method: 'GET',
            headers
        });
    }
    
    return (async () => {
        const response = await response$;
        if (response.status !== 200) {
            throw {
                errorCode: response.status,
                errorMessage: await response.json()
            };
        } else {
            return [
                response.headers.get("X-Next-Page-Time") || 0,
                (async() => {
                    const jsonContent = await response.json();
                    return (function* () {
                        for(let record of jsonContent) {
                            if(record) try {
                                let [event, time] = record;
                                time = parseInt(time);
                                if(isFinite(time)) switch (event.version) {
                                    case 1:
                                        const handle = eventV1Handle(event, time, userInitiator);
                                        if(handle) yield handle;
                                    break;
                                    case 2:
                                        yield* eventV2Handle(event, time);
                                    break;
                                }
                            } catch(error) {
                                console.log("Record handling error", error, record, userInitiator);
                            }
                        }
                    })();
                })()
            ]
        }
    })();
}
