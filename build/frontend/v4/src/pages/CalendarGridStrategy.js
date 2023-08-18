import { compile } from '../template-engine.js';
import {
    nextDatetime,
    mondayOfDateTime,
    dateTimeToString,
    monthOfDate,
    stringToDateTime
} from '../date-utils.js';


function makeCell({ strDate, todayStrDate, focusStrDate }, view, navigateTo) {
    let timeMap = new Map(view.get(strDate));

    let hasUnread = false;
    let hasAppointments = false;
    for(let { unread } of timeMap.values()) {
        hasAppointments = true;
        hasUnread |= unread;
    }

    return {
        strDate,
        hasAppointments,
        hasNoUnread: !hasUnread,
        inTodayMonth: monthOfDate(strDate) == monthOfDate(todayStrDate),
        isToday: strDate == todayStrDate,
        isFocus: strDate == focusStrDate,
        handleClick: () => navigateTo({
            url: '/appointments/day/',
            parameters: {
                strDate
            }
        })
    };
}

function* generateCols(
    { startDateTime, todayStrDate, focusStrDate },
    view, navigateTo
) {
    let cursorDateTime = mondayOfDateTime(startDateTime);
    for(let i = 0; i < 7; i++) {
        let strDate = dateTimeToString(cursorDateTime);

        yield makeCell({
            strDate,
            todayStrDate,
            focusStrDate
        }, view, navigateTo);

        cursorDateTime = nextDatetime(cursorDateTime);
    }
}

function* generateRows(
    { numberOfWeeks, todayStrDate, focusStrDate },
    view, navigateTo
) {
    let cursorDateTime = stringToDateTime(focusStrDate);
    for(let i = 0; i < numberOfWeeks; i++) {
        yield {
            cols: generateCols({
                startDateTime: cursorDateTime,
                todayStrDate,
                focusStrDate
            }, view, navigateTo)
        };

        cursorDateTime = nextDatetime(cursorDateTime, { weekShift: 1 });
    }
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
            if(!event.target.value)
                {return;}

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
    if(newEvents.length) {
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


function CalendarGridStartegy() {
    this.__templates = {
        main: compile(document.getElementById(
            "calendar-grid_main").innerText),
        rows: compile(document.getElementById(
            "calendar-grid_rows").innerText)
    };
}
CalendarGridStartegy.prototype = {
    paint: async function({ numberOfWeeks, firstWeekIncludes }) {
        if(!numberOfWeeks) {
            return await this.paint({
                numberOfWeeks: 5,
                firstWeekIncludes
            });
        } else if(!firstWeekIncludes) {
            return await this.paint({
                numberOfWeeks,
                firstWeekIncludes: dateTimeToString(Date.now())
            });
        } else {
            const firstWeekIncludes_dateTime = stringToDateTime(
                firstWeekIncludes
            );
            const todayStrDate = dateTimeToString(Date.now());

            const { view, newEvents } = await this.state;

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
            ).next();

            this.__templates.rows(
                this.anchorElement.querySelector(
                    "*[data-id=calendar-grid_rows]"
                ),
                {
                    rows: generateRows({
                        numberOfWeeks,
                        todayStrDate,
                        focusStrDate: firstWeekIncludes
                    }, view, this.navigateTo)
                }
            ).next();
        
        }
    }
};


export { CalendarGridStartegy };