/**
Author: Justin DEKEYSER
Year: August 2023
License: All rights reserved

Utility file to deal with dates and times.
===============================================================================
*/

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


export {
    now,
    unglueTemporalKey,
    glueTemporalKey,
    validateDateString,
    validateTimeString
};
