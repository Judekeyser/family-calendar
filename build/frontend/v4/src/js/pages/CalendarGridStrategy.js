import { safeCompileOnce } from '../template-engine.js';
import {
    nextDatetime,
    mondayOfDateTime,
    dateTimeToString,
    monthOfDate,
    stringToDateTime,
    now
} from '../date-utils.js';


function makeCell({ strDate, todayStrDate, focusStrDate }, view, navigateTo) {
    if(!strDate) {
        return {
            strDate: undefined,
            hasAppointments: false,
            hasNoUnread: true,
            inFocusMonth: true,
            isToday: false,
            isFocus: false,
            isDayOff: false,
            handleClick: undefined
        };
    } else {
        let timeMap = new Map(view.get(strDate));
    
        let hasUnread = false;
        let hasAppointments = false;
        let anyDayOff = false;
        for (let { unread, isDayOff } of timeMap.values()) {
            hasAppointments = true;
            hasUnread |= unread;
            anyDayOff |= isDayOff;
        }
    
        return {
            strDate,
            hasAppointments,
            hasNoUnread: !hasUnread,
            inFocusMonth: monthOfDate(strDate) == monthOfDate(focusStrDate),
            isToday: strDate == todayStrDate,
            isFocus: strDate == focusStrDate,
            isDayOff: anyDayOff,
            handleClick: () => navigateTo({
                url: '/appointments/day/',
                parameters: {
                    strDate
                }
            })
        };
    }
}

function generateTable(
    { numberOfWeeks, todayStrDate, focusStrDate },
    view, navigateTo
) {
    const focusDatetime = stringToDateTime(focusStrDate);
    const focusMonth = monthOfDate(focusStrDate);

    const dates = [];

    // First week is different because we have to prepend as many
    // blank days as the number of days out of month.
    let cursor = mondayOfDateTime(focusDatetime);
    for(;;) {
        const strDate = dateTimeToString(cursor);
        if(monthOfDate(strDate) == focusMonth) {
            break;
        } else {
            dates.push(null);
            cursor = nextDatetime(cursor);
        }
    }
    
    const numberOfDaysToFill = Math.min(numberOfWeeks, 5) * 7 - dates.length;
    let monthCursor = focusMonth;
    for(let i = 0; i < numberOfDaysToFill; i++) {
        const strDate = dateTimeToString(cursor);
        const cursorMonth = monthOfDate(strDate);
        if(cursorMonth !== monthCursor) {
            for(let j = 0; j < 7; j++) {
                dates.push(null);
            }
            monthCursor = cursorMonth;
        }
        dates.push(strDate);
        cursor = nextDatetime(cursor);
    }

    if(numberOfWeeks == 6) {
        const lastMonth = monthOfDate(dates[dates.length - 1]);
        for(let dayCount = dates.length;;) {
            const strDate = dateTimeToString(cursor);
            const cursorMonth = monthOfDate(strDate);
            if(cursorMonth !== lastMonth) {
                for(let j = 0; j < 7 - (dayCount % 7); j++) {
                    dates.push(null);
                }
                break;
            } else {
                dates.push(strDate);
                cursor = nextDatetime(cursor);
                dayCount += 1;
            }
        }
    }


    const blocks = [];
    for(let i = 0; i < dates.length;) {
        const block = [];
        let week = [];
        do {
            week = dates.slice(i, i += 7);
            block.push(week);
        } while(week[6]);
        blocks.push(block);
    }

    return {
        blocks: blocks.map(block => ({
            rows: block.map(week => ({
                cols: week.map(strDate => makeCell({
                    strDate, todayStrDate, focusStrDate
                }, view, navigateTo))
            })),
            strDate: block[0].find(Boolean)
        }))
    };
}

function makeNumberOfWeeksCtrl(
    { numberOfWeeks, firstWeekIncludes },
    navigateTo
) {
    return {
        handleChange: event => {
            navigateTo({
                url: '/calendar-grid/',
                parameters: {
                    firstWeekIncludes,
                    numberOfWeeks: event.target.value
                }
            });
        },
        value: numberOfWeeks
    };
}

function makeFirstDateIncludesCtrl(
    { dateTime, numberOfWeeks },
    navigateTo
) {
    return {
        handleChange: event => {
            if (!event.target.value) { return; }

            navigateTo({
                url: '/calendar-grid/',
                parameters: {
                    firstWeekIncludes: dateTimeToString(event.target.value),
                    numberOfWeeks
                }
            });
        },
        value: dateTimeToString(dateTime)
    };
}

function makeNextWeekCtrl({ dateTime, numberOfWeeks }, navigateTo) {
    return {
        handleClick: () => {
            navigateTo({
                url: '/calendar-grid/',
                parameters: {
                    firstWeekIncludes: dateTimeToString(
                        nextDatetime(dateTime, { weekShift: 1 })
                    ),
                    numberOfWeeks
                }
            });
        }
    };
}

function makePreviousWeekCtrl({ dateTime, numberOfWeeks }, navigateTo) {
    return {
        handleClick: () => {
            navigateTo({
                url: '/calendar-grid/',
                parameters: {
                    firstWeekIncludes: dateTimeToString(
                        nextDatetime(dateTime, { weekShift: -1 })
                    ),
                    numberOfWeeks
                }
            });
        }
    };
}

function makeUnreadNavigation({ newEvents }, navigateTo) {
    if (newEvents.length) {
        return {
            size: newEvents.length,
            handleClick: () => {
                navigateTo({
                    url: '/appointments/unread/',
                    parameters: {}
                });
            }
        };
    }
}

function makeSearchNavigation(navigateTo) {
    return {
        handleClick: () => {
            navigateTo({
                url: '/appointments/search/',
                parameters: {}
            });
        }
    };
}


const GRID_MAIN_ID = "calendar-grid_main";
const GRID_ROWS_ID = "calendar-grid_rows";

function CalendarGridStartegy() {
    const reservedUuids = new Set();
    const mainTemplate = safeCompileOnce(
        document.getElementById(GRID_MAIN_ID).innerText,
        reservedUuids
    );
    this.__templates = {
        main: mainTemplate,
        rows: safeCompileOnce(
            document.getElementById(GRID_ROWS_ID).innerText,
            reservedUuids, true
        )
    };
}
CalendarGridStartegy.prototype = {
    paint: async function ({ numberOfWeeks, firstWeekIncludes }) {
        if (!numberOfWeeks) {
            const fromStore = sessionStorage.getItem('numberOfWeeks');
            const recovered = fromStore || 5;
            return await this.paint({
                numberOfWeeks: recovered,
                firstWeekIncludes
            });
        } else {
            sessionStorage.setItem('numberOfWeeks', numberOfWeeks);
        }
        if (!firstWeekIncludes) {
            const fromStore = sessionStorage.getItem('firstWeekIncludes');
            const recovered = fromStore || now();
            return await this.paint({
                numberOfWeeks,
                firstWeekIncludes: recovered
            });
        } else {
            sessionStorage.setItem('firstWeekIncludes', firstWeekIncludes);
        }

        const { view, newEvents } = await this.state;
        this.anchorElement.setAttribute("data-id", GRID_MAIN_ID);

        const firstWeekIncludes_dateTime = stringToDateTime(
            firstWeekIncludes
        );
        const todayStrDate = now();

        this.__templates.main(
            this.anchorElement,
            {
                numberOfWeeksController: makeNumberOfWeeksCtrl({
                    numberOfWeeks,
                    firstWeekIncludes
                }, this.navigateTo),
                firstDateIncludesController: makeFirstDateIncludesCtrl({
                    dateTime: firstWeekIncludes_dateTime,
                    numberOfWeeks
                }, this.navigateTo),
                previousWeekController: makePreviousWeekCtrl({
                    dateTime: firstWeekIncludes_dateTime,
                    numberOfWeeks
                }, this.navigateTo),
                nextWeekController: makeNextWeekCtrl({
                    dateTime: firstWeekIncludes_dateTime,
                    numberOfWeeks
                }, this.navigateTo),
                unreadNavigation: makeUnreadNavigation(
                    { newEvents }, this.navigateTo
                ),
                searchNavigation: makeSearchNavigation(this.navigateTo)
            }
        );

        this.__templates.rows(
            this.anchorElement.querySelector(`*[data-id=${GRID_ROWS_ID}]`),
            generateTable({
                numberOfWeeks, todayStrDate,
                focusStrDate: firstWeekIncludes
            }, view, this.navigateTo)
        );
    }
};


export { CalendarGridStartegy };