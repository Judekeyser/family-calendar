/**
Author: Justin DEKEYSER
Year: August 2023
License: All rights reserved

Utility file to deal with dates and times.
===============================================================================
*/

/**
 * Gets the current date, as a string. This is wrapped for coherency reasons.
 * 
 * @returns {string} - The date, as a string
 */
function now()
{
    const nowDate = new Date(Date.now());
    const [day, month, year] = nowDate.toLocaleDateString("fr-BE").split("/");
    return [year, month, day].join('-');
}

/**
 * Computes the UTC day of week corresponding to a timestamp from Epoch.
 * This computation is meant for module private usages.
 * 
 * @param {number} datetime - The datetime, as a timestamp from Epoch
 * @returns {number} - The UTC day of week
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
 * @param {number} datetime - As a timestamp from Epoch
 * @returns {string} - The date, as a YYYY-MM-DD
 * ----------------------------------------------------------------------------
 */
function dateTimeToString(datetime)
{
    const EXPECTED_LENGTH = "YYYY-MM-DD".length;

    return new Date(datetime).toISOString().substring(0, EXPECTED_LENGTH);
}


/**
 * Parse a given string that must follow the format YYYY-MM-DD, and returns
 * a timestamp from Epoch that corresponds to that string (itself interpreted
 * as a date in UTC). The method does not validate the input.
 * 
 * @param {string} strDate - A date, as a string 
 * @returns {number} - The date, as a timestamp from Epoch
 * ----------------------------------------------------------------------------
 */
function stringToDateTime(strDate)
{
    // Checkout MDN: Web/JavaScript/Reference/Global_Objects/Date/parse
    // The parse method with a day YYYY-MM-DD is understood in UTC.
    return Date.parse(strDate);
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
 * @param {number} datetime - The reference timestamp from Epoch
 * @param {{dayShift?: number, weekShift?: number}} [options] - Options
 * @returns {number} - A timestamp whose day of week comes next
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
            return datetime + dayShift * DAY_SHIFT;
        }
    }
}

/**
 * Computes a timestamp from Epoch, whose UTC day of week is guaranteed to be
 * the first Monday preceding the provided reference. If the reference is
 * already a Monday, the same reference is returned.
 * 
 * @param {number} datetime - The reference timestamp from Epoch
 * @returns {number} - The first Monday before, as a timestamp from Epoch 
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
 * @param {string} strDate - The date string
 * @returns {DayPart} - The day part
 * ----------------------------------------------------------------------------
 */
function dayOfDate(strDate)
{
    const dayPart = /** @type {DayPart} */ (strDate.substring(8, 10));
    return dayPart;
}

/**
 * Given a date string in YYYY-MM-DD format, returns the MM segment.
 * 
 * @typedef {(
*  '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12'
* )} MonthPart
 * 
 * @param {string} strDate - The date string
 * @returns {MonthPart} - The month part
 * ----------------------------------------------------------------------------
 */
function monthOfDate(strDate)
{
    const monthPart = /** @type {MonthPart} */ (strDate.substring(5, 7));
    return monthPart;
}

/**
 * Given a date string in YYYY-MM-DD format, returns the YYYY segment.
 * 
 * @param {string} strDate - The date string
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
 * @param {string} strTime - The time to convert for easy sorting
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
 * @param {string} a - The first time, as a string
 * @param {string} b - The second time, as a string 
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
 * Compares two records that both contain a string-date and a string-time.
 * The date is always checked first, and only in case of equality, this method
 * compares the times using the {@link strTimeSorting} method.
 * 
 * @param {{strDate: string, strTime: string}} a - The first record
 * @param {{strDate: string, strTime: string}} b - The second record 
 * @returns {-1 | 1 | 0} - The result of the comparison
 * ----------------------------------------------------------------------------
 */
function recordSorting(a, b)
{
    return a.strDate === b.strDate
        ? strTimeSorting(a.strTime, b.strTime)
        : a.strDate <= b.strDate ? -1 : 1;
}

/**
 * Computes if two times (as string, in the general sense) overlap each
 * others.
 * 
 * Example:
 *  - "afternoon" and 14:39, overlap each others.
 * 
 * @param {string} a - The first time-string
 * @param {string} b - The second time-string
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
    recordSorting
};
