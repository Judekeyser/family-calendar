/**
Author: Justin DEKEYSER
Year: August 2023
License: All rights reserved

Utility file to deal with dates and times.
===============================================================================
*/

/**
 * @typedef {number & ((_0: undefined & null) => 'Timestamp')} Timestamp
 * @param {number} _ - Timestamp from Epoch
 * @returns {Timestamp}
 * ----------------------------------------------------------------------------
 */
function castTimestamp(_) {
    return (
        /**
         * @type {Timestamp}
         */ (_)
    );
}

/**
 * @param {string} _ - The input to cast as a string
 * @returns {DateString}
 * ----------------------------------------------------------------------------
 */
function castDate(_) {
    return (
        /**
         * @type {DateString}
         */ (_)
    );
}

/**
 * @param {string} _ - The input to cast as a string
 * @returns {TimeString}
 * ----------------------------------------------------------------------------
 */
function castTime(_) {
    return (
        /**
         * @type {TimeString}
         */ (_)
    );
}

/**
 * @param {string} _ - The input to cast as a string
 * @returns {TemporalKeyString}
 * ----------------------------------------------------------------------------
 */
function castTemporalKeyString(_) {
    return (
        /**
         * @type {TemporalKeyString}
         */ (_)
    );
}

const YEAR_PATTERN = /^20[0-9][0-9]$/;
const MONTH_PATTERN = /^(0[1-9]|1[0-2])$/;
const DAY_PATTERN = /^([0-2][0-9]|3[0-1])$/;
const HOUR_PATTERN = /^([0-1][0-9]|2[0-4])$/;
const MINUTE_PATTERN = /^[0-5][0-9]$/;
/**
 * @param {unknown} input - The expected date string
 * @returns {DateString | null} - As a date string, or nothing if invalid
 * ----------------------------------------------------------------------------
 */
function validateDateString(input) {
    valid: {
        if(typeof input != "string") {
            break valid;
        }
        const yearSegment = input.substring(0, 4);
        const monthSegment = input.substring(5, 7);
        const daySegment = input.substring(8, 10);

        if(!yearSegment.match(YEAR_PATTERN)) {
            break valid;
        }
        if(!monthSegment.match(MONTH_PATTERN)) {
            break valid;
        }
        if(!daySegment.match(DAY_PATTERN)) {
            break valid;
        } else if(daySegment == "31") {
            switch(monthSegment) {
                case "02":
                case "04":
                case "06":
                case "09":
                case "11":
                    break valid;
            }
        } else if (daySegment >= "29" && monthSegment == "02") {
            break valid;
        } else if (daySegment == "29" && monthSegment == "02") {
            /* Leap years are divisible by 400, or else by 4 but not by 100
                We know the YEAR_PATTERN only allows dates before 2100,
                strictly. So we only have to take into account divisers of 4
                in [2000,2100), which we trivially do with a switch on the
                last two digits, cause the pattern repeats
            */
            leapCheck: {
                switch(yearSegment[2]) {
                case "0":
                case "2":
                case "4":
                case "6":
                case "8":
                    switch(yearSegment[3]) {
                        case "0":
                        case "4":
                        case "8":
                            break leapCheck;
                        default:
                            break valid;
                    }
                default:
                    switch(yearSegment[3]) {
                        case "2":
                        case "6":
                            break leapCheck;
                        default:
                            break valid;
                    }
                }
            }
        }
        return castDate([yearSegment, monthSegment, daySegment].join('-'));
    }
    return null;
}

/**
 * @param {unknown} input - The expected time string
 * @returns {TimeString | null} - As a time string, or nothing if invalid
 * ----------------------------------------------------------------------------
 */
function validateTimeString(input) {
    valid: {
        if(typeof input != "string") {
            break valid;
        }
        switch(input) {
            case "fullday":
            case "morning":
            case "afternoon":
                return castTime(input);
            default: {
                const hourSegment = input.substring(0, 2);
                const minuteSegment = input.substring(3, 5);
            
                if(!hourSegment.match(HOUR_PATTERN)) {
                    break valid;
                }
                if(!minuteSegment.match(MINUTE_PATTERN)) {
                    break valid;
                }
                return castTime([hourSegment, minuteSegment].join(':'));
            }
        }
    }
    return null;
}

/**
 * 
 * @param {TemporalKey} temporalKey - The temporal key, unglued
 * @returns {TemporalKeyString} - The temporal key string
 * ----------------------------------------------------------------------------
 */
function glueTemporalKey(temporalKey) {
    const { date, time } = temporalKey;
    return castTemporalKeyString(`${date} ${time}`);
}

/**
 * @param {TemporalKeyString} temporaleyString - the temporal key as a string
 * @returns {TemporalKey} - The unglued key
 * ----------------------------------------------------------------------------
 */
function unglueTemporalKey(temporaleyString) {
    const strDate = temporaleyString.substring(
        0, temporaleyString.indexOf(" ")
    );
    const strTime = temporaleyString.substring(strDate.length + 1);

    const date = validateDateString(strDate);
    const time = validateTimeString(strTime);
    return (
        /**
         * @type {TemporalKey}
         */
        ({ date, time })
    );
}

/**
 * Gets the current date, as a string. This is wrapped for coherency reasons.
 * 
 * @returns {DateString} - The date, as a string
 * ----------------------------------------------------------------------------
 */
function now()
{
    // Check MDN: Date.now returns a timestamp from epoch.
    // Date constructor from number will agree on this convention.
    // This means that for a belgian user, the iso string might not correspond
    // to today date (because of timezone). We thus extract a local string
    // and recreate the correct datestring.
    const nowDate = new Date(Date.now());
    const localString = nowDate.toLocaleDateString("fr-BE");
    const [day, month, year] = localString.split("/");
    return castDate([year, month, day].join('-'));
}

/**
 * Computes the UTC day of week corresponding to a timestamp from Epoch.
 * This computation is meant for module private usages.
 * 
 * @param {Timestamp} datetime - The datetime, as a timestamp from Epoch
 * @returns {number} - The UTC day of week
 * ----------------------------------------------------------------------------
 */
function __dayOfWeek(datetime)
{
    return new Date(datetime).getUTCDay();
}

/**
 * Returns a string representation of the date corresponding to the provided
 * timestamp. Information about time (hours, minutes, ...) are forgotten by
 * this process.
 * 
 * @param {Timestamp} datetime - As a timestamp from Epoch
 * @returns {DateString} - The date, as a YYYY-MM-DD
 * ----------------------------------------------------------------------------
 */
function dateTimeToString(datetime)
{
    // Compared to `now`, the current method is not supposed to use locals.
    // It uses UTC conventions, as it is meant to be used through computations
    // on timestamp. We cannot reason in timestamps with locals.
    const EXPECTED_LENGTH = "YYYY-MM-DD".length;
    const isoString = new Date(datetime).toISOString();

    return castDate(isoString.substring(0, EXPECTED_LENGTH));
}

/**
 * Parse a given string that must follow the format YYYY-MM-DD, and returns
 * a timestamp from Epoch that corresponds to that string (itself interpreted
 * as a date in UTC). The method does not validate the input.
 * 
 * This method is the converse of `datetimeToString`.
 * 
 * @param {DateString} strDate - A date, as a string 
 * @returns {Timestamp} - The date, as a timestamp from Epoch
 * ----------------------------------------------------------------------------
 */
function stringToDateTime(strDate)
{
    // Checkout MDN: Web/JavaScript/Reference/Global_Objects/Date/parse
    // The parse method with a day YYYY-MM-DD is understood in UTC.
    return castTimestamp(Date.parse(strDate));
}

/**
 * Iterates on a datetime (as a timestamp from Epoch) to get the next one,
 * with a day (24 hours) based step.
 * 
 * This methods accepts options to specify the day and week shifts. They
 * might be null or negative. If unspecified or both null, they are
 * interpreted as a shift of 1 day forward.
 * 
 * Example:
 *  - Shifting by one day forward might be done using
 *      `nextDatetime(d, { dayShift: 1 })`
 *    or equivalently
 *      `nextDatetime(d)`
 * 
 *  - Shifting by two weeks backward might be done with
 *      `nextDatetime(d, { weekShift: -2 })
 * 
 * @param {Timestamp} datetime - The reference timestamp from Epoch
 * @param {{dayShift?: number, weekShift?: number}} [options] - Options
 * @returns {Timestamp} - A timestamp whose day of week comes next
 * ----------------------------------------------------------------------------
 */
function nextDatetime(datetime, options)
{
    if(!options) {
        return nextDatetime(datetime, {});
    } else {
        const { dayShift, weekShift } = options;
        if(weekShift || !dayShift) {
            const effectiveDayShift = {
                dayShift: weekShift ? (weekShift*7 + (dayShift || 0)) : 1
            };
            return nextDatetime(datetime, effectiveDayShift);
        } else {
            const DAY_SHIFT = 1000*60*60*24;
            return castTimestamp(datetime + dayShift * DAY_SHIFT);
        }
    }
}

/**
 * Computes a timestamp from Epoch, whose UTC day of week is guaranteed to be
 * the first Monday preceding the provided reference. If the reference is
 * already a Monday, the same reference is returned.
 * 
 * @param {Timestamp} datetime - The reference timestamp from Epoch
 * @returns {Timestamp} - The first Monday before, as a timestamp from Epoch 
 * ----------------------------------------------------------------------------
 */
function mondayOfDateTime(datetime)
{
    const dayOfWeek = __dayOfWeek(datetime);
    const dayShift = - ((dayOfWeek + 6) % 7);

    return dayShift ? nextDatetime(datetime, { dayShift }) : datetime;
}

/**
 * Given a date string in YYYY-MM-DD format, returns the DD segment.
 * 
 * @typedef {(
 *  '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|
*   '11'|'12'|'13'|'14'|'15'|'16'|'17'|'18'|'19'|'20'|
*   '21'|'22'|'23'|'24'|'25'|'26'|'27'|'28'|'29'|'30'|'31'
 * )} DayPart
 * 
 * @param {DateString} strDate - The date string
 * @returns {DayPart} - The day part
 * ----------------------------------------------------------------------------
 */
function dayOfDate(strDate)
{
    const dayPart = (
        /**
         * @type {DayPart}
         */ (strDate.substring(8, 10))
    );
    return dayPart;
}

/**
 * Given a date string in YYYY-MM-DD format, returns the MM segment.
 * 
 * @typedef {(
*  '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12'
* )} MonthPart
 * 
 * @param {DateString} strDate - The date string
 * @returns {MonthPart} - The month part
 * ----------------------------------------------------------------------------
 */
function monthOfDate(strDate)
{
    const monthPart = (
        /**
         * @type {MonthPart}
         */ (strDate.substring(5, 7))
    );
    return monthPart;
}

/**
 * Given a date string in YYYY-MM-DD format, returns the YYYY segment.
 * 
 * @param {DateString} strDate - The date string
 * @returns {string} - The year part
 * ----------------------------------------------------------------------------
 */
function yearOfDate(strDate)
{
    return strDate.substring(0, 4);
}


/**
 * Converts the time, as a rich entity, to a token that can be used for easy
 * sorting by lexicographic ordering, preserving the equivalence between
 * lexicographic sort and chronological sort.
 * 
 * @param {TimeString} strTime - The time to convert for easy sorting
 * @returns An alternative representation of the time
 * ----------------------------------------------------------------------------
 */
function strTimeSortConverter(strTime)
{
    switch(strTime) {
        case "fullday": return "";
        case "afternoon": return "12";
        case "morning": return "00";
        default: return strTime;
    }
}

/**
 * Compares two time-strings. This method is a comparator function, and
 * follows the usual related protocol. In particular, the method is
 * skew-symmetric, transitive, and reflexive.
 * 
 * Supported time string are of the kind HH:MM but can also be one
 * of "afternoon", "morning" or "fullday". The "fullday" always comes first,
 * while lexical tokens "morning" and "afternoon" always comes before the
 * times that occur during them.
 * 
 * Example:
 *  - 13:00 is bigger than afternoon
 *  - 10:56 is bigger than morning, but smaller than afternoon
 *  - 00:00 is strictly bigger than morning
 * 
 * @param {TimeString} a - The first time, as a TimeString
 * @param {TimeString} b - The second time, as a TimeString 
 * @returns {-1 | 1 | 0} - The result of the comparison
 * ----------------------------------------------------------------------------
 */
function strTimeSorting(a, b)
{
    if(a == b) {
        return 0;
    } else {
        return strTimeSortConverter(a) <= strTimeSortConverter(b) ? -1 : 1;
    }
}

/**
 * Computes if two times (as string, in the general sense) overlap each
 * others.
 * 
 * Example:
 *  - "afternoon" and 14:39, overlap each others.
 * 
 * @param {TimeString} a - The first time-string
 * @param {TimeString} b - The second time-string
 * @returns {boolean} whether or not the time overlap each others
 * ----------------------------------------------------------------------------
 */
function strTimeOverlap(a, b)
{
    return (
           a == b
        || a == "fullday"
        || b == "fullday"
        || (a == "afternoon" && b >= "12:00")
        || (b == "afternoon" && a >= "12:00")
        || (a == "morning" &&  b < "12:00")
        || (b == "morning" && a < "12:00")
    );
}

/**
 * Generate a grid table, given a specified number of weeks.
 * Every block corresponds to weeks of a month, and contains
 * weeks to display. Every week is made of seven entries,
 * that might be undefined (in case the week does not fully
 * cover a month)
 * 
 * @param {DateString} focusDate
 * @param {number} numberOfWeeks
 * @param {boolean} coverLastMonthEntirely
 * @returns {Array.<Array.<Array.<DateString | undefined>>>}
 * ----------------------------------------------------------------------------
 */
function computeGrid(focusDate, numberOfWeeks, coverLastMonthEntirely) {
    const focusDatetime = stringToDateTime(focusDate);

    /**
     * @type {Array.<DateString>}
     */
    const dates = [];

    // Hard filling the dates with the correct amount of days.
    {
        const numberOfDays = numberOfWeeks * 7;

        let cursor = mondayOfDateTime(focusDatetime);
        for(let i = 0; i < numberOfDays; i++) {
            dates.push(dateTimeToString(cursor));
            cursor = nextDatetime(cursor);
        }

        if(coverLastMonthEntirely) {
            const lastMonthInserted = monthOfDate(dates[dates.length - 1]);
            for(;;) {
                const date = dateTimeToString(cursor);
                if(monthOfDate(date) == lastMonthInserted) {
                    dates.push(date);
                    cursor = nextDatetime(cursor);
                } else {
                    break;
                }
            }
        }
    }

    /**
     * @type {Array.<DateString | undefined>}
     */
    const rectifiedDates = [];

    {
        let currentMonth = monthOfDate(focusDate);
        for(let i = 0; i < dates.length; i++) {
            const date = dates[i];

            if(date < focusDate) {
                if(monthOfDate(date) != currentMonth) {
                    rectifiedDates.push(undefined);
                } else {
                    rectifiedDates.push(date);
                }
            } else {
                const dateMonth = monthOfDate(date);
                if(currentMonth !== dateMonth && (i % 7)) {
                    // Month shift, not a Monday. Need to insert 7 cells first
                    for(let j = 0; j < 7; j++) {
                        rectifiedDates.push(undefined);
                    }
                }
                currentMonth = dateMonth;
                rectifiedDates.push(date);
            }
        }

        while(rectifiedDates.length % 7) {
            rectifiedDates.push(undefined);
        }
    }

    // Group by seven!
    // A group starts when the week starts with undefined or 01

    /**
     * @type {Array.<Array.<Array.<DateString | undefined>>>}
     */
    const blocks = [];
    for(let i = 0; i < rectifiedDates.length;) {
        const date = rectifiedDates[i];
        if(i == 0 || !date || dayOfDate(date) === "01") {
            blocks.push([]);
        }
        const lastBlock = blocks[blocks.length - 1];
        lastBlock.push(rectifiedDates.slice(i, i += 7));
    }

    return blocks;
}


export {
    now,
    dateTimeToString,
    nextDatetime,
    mondayOfDateTime,
    stringToDateTime,
    dayOfDate,
    monthOfDate,
    yearOfDate,
    strTimeSorting,
    strTimeOverlap,
    validateDateString,
    validateTimeString,
    computeGrid,
    glueTemporalKey,
    unglueTemporalKey
};
