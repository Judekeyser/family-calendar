import { safeCompileOnce } from '../template-engine.js';
import {
    nextDatetime,
    dateTimeToString,
    monthOfDate,
    stringToDateTime,
    now,
    validateDateString,
    computeGrid
} from '../date-utils.js';

/**
 * @typedef {{
 *  strDate: DateString,
 *  hasAppointments: boolean,
 *  hasNoUnread: boolean,
 *  inFocusMonth: boolean,
 *  isToday: boolean,
 *  isFocus: boolean,
 *  isDayOff: boolean,
 *  handleClick: *
 * }} FilledTemplateGridCellData
 *
 * @typedef {{
 *  strDate: undefined,
 *  hasAppointments: false,
 *  hasNoUnread: true,
 *  inFocusMonth: true,
 *  isToday: false,
 *  isFocus: false,
 *  isDayOff: false,
 *  handleClick: undefined
 * }} UnfilledTemplateGridCellData
 * 
 * @typedef {UnfilledTemplateGridCellData |
 *           FilledTemplateGridCellData} TemplateGridCellData
 */


/**
 * 
 * @param {{
 *  strDate: DateString | undefined,
 *  todayStrDate: DateString,
 *  focusStrDate: DateString
 * }} dateData 
 * @param {View} view 
 * @param {NavigateToCallback} navigateTo 
 * @returns {TemplateGridCellData}
 */
function makeCell(dateData, view, navigateTo) {
    const { strDate, todayStrDate, focusStrDate } = dateData;
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
        const timeMap = new Map(view.get(strDate));
    
        let hasUnread = false;
        let hasAppointments = false;
        let anyDayOff = false;
        for (const { unread, isDayOff } of timeMap.values()) {
            hasAppointments = true;
            hasUnread = hasUnread || unread;
            anyDayOff = anyDayOff || isDayOff;
        }
    
        return {
            strDate,
            hasAppointments,
            hasNoUnread: !hasUnread,
            inFocusMonth: monthOfDate(strDate) == monthOfDate(focusStrDate),
            isToday: strDate == todayStrDate,
            isFocus: strDate == focusStrDate,
            isDayOff: anyDayOff,
            handleClick: () => void navigateTo({
                url: '/appointments/day/',
                parameters: {
                    strDate
                }
            })
        };
    }
}

/**
 * 
 * @param {{
 *  numberOfWeeks: number,
 *  todayStrDate: DateString,
 *  focusStrDate: DateString
 * }} tableData 
 * @param {View} view 
 * @param {NavigateToCallback} navigateTo 
 * @returns {{
 *  blocks: Array.<{
 *      rows: Array.<{
 *          cols: Array.<TemplateGridCellData>
 *      }>,
 *      strDate: DateString | undefined
 *  }>
 * }}
 */
function generateTable(tableData, view, navigateTo) {
    const { numberOfWeeks, todayStrDate, focusStrDate } = tableData;

    const blocks = computeGrid(
        focusStrDate, Math.min(5, numberOfWeeks), numberOfWeeks == 6
    );

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
    const uuids = new Set();
    const gridMainContainer = (
        /**
         * @type {HTMLElement}
         */ (document.getElementById(GRID_MAIN_ID))
    );
    const gridRowsContainer = (
        /**
         * @type {HTMLElement}
         */ (document.getElementById(GRID_ROWS_ID))
    );

    const mainTemplate = safeCompileOnce(gridMainContainer.innerText, uuids);
    this.__templates = {
        main: mainTemplate,
        rows: safeCompileOnce(gridRowsContainer.innerText, uuids, true)
    };
}
CalendarGridStartegy.prototype = {
    get _environment() {
        return (
            /**
             * @type {PageEnvironmentConfig}
             */ (
                /**
                 * @type {unknown}
                 */ (this)
            )
        );
    },

    /**
     * @param {{
     *  numberOfWeeks: number | undefined,
     *  firstWeekIncludes: DateString | undefined
     * }} parameters 
     * @returns {Promise<unknown>}
     */
    paint: async function(parameters) {
        const { numberOfWeeks, firstWeekIncludes } = parameters;
        if (!numberOfWeeks) {
            const fromStore = sessionStorage.getItem('numberOfWeeks');
            if(fromStore) {
                const numberFromStore = parseInt(fromStore);
                if(isFinite(numberFromStore)) {
                    return await this.paint({
                        numberOfWeeks: numberFromStore,
                        firstWeekIncludes
                    });
                }
            }
            return await this.paint({
                numberOfWeeks: 5,
                firstWeekIncludes
            });
        } else {
            sessionStorage.setItem('numberOfWeeks', String(numberOfWeeks));
        }
        if (!firstWeekIncludes) {
            const fromStore = sessionStorage.getItem('firstWeekIncludes');
            if(fromStore) {
                const dateFromStore = validateDateString(fromStore);
                if(dateFromStore) {
                    return await this.paint({
                        numberOfWeeks,
                        firstWeekIncludes: dateFromStore
                    });
                }
            }
            return await this.paint({
                numberOfWeeks,
                firstWeekIncludes: now()
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

        return undefined;
    }
};


export { CalendarGridStartegy };