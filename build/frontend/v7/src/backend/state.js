import {parseDate, shift, monthToFrenchName, now} from "./date";

function computeState(url) {
    var path,                       // The path passed in the url through `path` key
        focusDate,                  // The date passed in the url through `focusdate` key
        focusDate_nextWeek,         // the date 1 week after `focusdate`
        focusDate_previousWeek,     // the date 1 week before `focusdate`
        focusDate_nextDay,          // the date 1 day after `focusdate`
        focusDate_previousDay,      // the date 1 day before `focusdate`
        state = {};

    path = url.get("path") || "calendar-grid";
    focusDate = parseDate(url.get("focusdate") || "") || parseDate(now());

    focusDate_nextWeek = shift(focusDate, 7);
    focusDate_previousWeek = shift(focusDate, -7);
    focusDate_nextDay = shift(focusDate, 1);
    focusDate_previousDay = shift(focusDate, -1);

    /* Set date-based-navigation of state */
    {
        let nextDateTextual, previousDateTextual;
        switch(path) {
            case "calendar-grid":
            case "alter-calendar":
            {
                nextDateTextual = focusDate_nextWeek?.textual;
                previousDateTextual = focusDate_previousWeek?.textual;
            } break;
        }
        state["date-based-navigation"] = {
            "now-date": focusDate?.textual,
            "next-date": nextDateTextual,
            "previous-date": previousDateTextual,
        }
    }

    /* Set navigation menu */
    {
        const hyperlinks = {
            "create": {
                "path": "alter-calendar"
            },
            "unreads": {
                "path": "unread-appointments"
            },
            "search": {
                "path": "search-appointment"
            }
        };
        let navigationMenuLinks;
        switch(path) {
            case "calendar-grid": {
                navigationMenuLinks = [hyperlinks.create, hyperlinks.unreads, hyperlinks.search]
            } break;
            case "alter-calendar": {
                navigationMenuLinks = [hyperlinks.unreads, hyperlinks.search];
            } break;
        }
        if(navigationMenuLinks) {
            state["navigation-menu"] = {
                "links": navigationMenuLinks,
                "unreads-count": undefined
            }
            if(navigationMenuLinks.includes("unreads")) {
                state["navigation-menu"]["unreads-count"] = 6;
            }
        }
    }

    /* Set calendar grid */
    if(focusDate && path === "calendar-grid") {
        const blocks = [];

        let numberOfRemainingWeek = 20;

        let cursorDate = shift(focusDate, -(focusDate.numeric % 7));
        let cursorMonth = cursorDate.structured.month;

        blockIterator: for(;;) {
            const block = {
                "month": monthToFrenchName(cursorMonth),
                "weeks": []
            };
            for(;;) {
                if(numberOfRemainingWeek--) {
                    const week = [];
                    for(let i = 0; i < 7; i++) {
                        if(cursorDate.structured.month === cursorMonth) {
                            week.push({
                                "displayed-date": String(cursorDate.structured.day),
                                "cell-detail-link": {
                                    "path": "alter-calendar",
                                    "focusdate": cursorDate.textual
                                }
                            })
                        } else {
                            week.push({})
                        }
                        cursorDate = shift(cursorDate, 1);
                    }
                    block.weeks.push(week);
                    if(cursorDate.structured.month !== cursorMonth) {
                        cursorMonth = cursorDate.structured.month;
                        if(cursorDate.structured.day !== 1) {
                            numberOfRemainingWeek += 1;
                            cursorDate = shift(cursorDate, -7);
                        }
                        blocks.push(block);
                        break;
                    }
                } else break blockIterator;
            }
        }
        state["calendar-grid"] = {
            "blocks": blocks
        }
    }

    /* Set alter calendar form data */
    if(path === "alter-calendar") {
        state["alter-calendar"] = {
            "date": focusDate || undefined,
            "time": undefined,
            "time_arena": "once",
            "description": undefined,
            "details": undefined,
            "can_cancel": false
        }
    }

    return state;
}

export default computeState;