const DAY_MAX_TABLE_NONLEAP = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
const DAY_MAX_TABLE_LEAP = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
const CYCLE_SIZE = 365*4+1;

function div(a,b) {
    return parseInt(a/b);
}
function numericToUnsafeStruct(numericValue) {
    const cyclesBefore = div(numericValue, CYCLE_SIZE);
    const yearsOutOfCycle = numericValue % CYCLE_SIZE;

    const yearsBefore = Math.min(div(yearsOutOfCycle, 365), 3);
    const year = cyclesBefore * 4 + yearsBefore + 2001;

    numericValue = yearsOutOfCycle - 365 * yearsBefore; // Reduce the days to the numbers of days from inside the year
    const table = yearsBefore === 3 ? DAY_MAX_TABLE_LEAP : DAY_MAX_TABLE_NONLEAP;

    numericValue += 1;
    let month;
    for(month = 1; table[month] < numericValue; month++) {
        numericValue -= table[month];
    }

    return {
        unsafeYear: year,
        unsafeMonth: month,
        unsafeDay: numericValue
    };
}
function structToString({ year, month, day }) {
    month = (month < 10 ? '0' : '') + month
    day = (day < 10 ? '0' : '') + day
    return `${year}-${month}-${day}`;
}
function isStructureValid({ unsafeYear, unsafeMonth, unsafeDay }) {
    const yearValid = isFinite(unsafeYear) && unsafeYear < 2099 && unsafeYear > 2001;
    if(yearValid) {
        const monthValid = isFinite(unsafeMonth) && unsafeMonth >= 1 && unsafeMonth <= 12;
        const table = unsafeYear % 4 ? DAY_MAX_TABLE_NONLEAP : DAY_MAX_TABLE_LEAP;
        const dayValid = isFinite(unsafeDay) && unsafeDay >= 1 && unsafeDay <= table[unsafeMonth]
        return dayValid && monthValid;
    }
    return false;
}
function toMaybeValidStructure(structure) {
    if(isStructureValid(structure)) {
        return {
            year: structure.unsafeYear,
            month: structure.unsafeMonth,
            day: structure.unsafeDay
        }
    } else return null;
}
function stringToMaybeSafeStruct(stringValue) {
    const unsafeYear = parseInt(stringValue.substring(0, 4));
    const unsafeMonth = parseInt(stringValue.substring(5, 7));
    const unsafeDay = parseInt(stringValue.substring(8, 10));

    const candidate = { unsafeYear, unsafeMonth, unsafeDay };
    return toMaybeValidStructure(candidate);
}
function structToNumeric({ year, month, day }) {
    const sYear = year - 2001;
    const table = year % 4 ? DAY_MAX_TABLE_NONLEAP : DAY_MAX_TABLE_LEAP;
    let cumulMonthDays = 0;
    for(let i = month; i--;) {
        cumulMonthDays += table[i];
    }

    return day + cumulMonthDays + div(sYear, 4)*CYCLE_SIZE + (sYear%4)*365 - 1;
}

export function parseDate(strDate) {
    const maybeSafeStruct = stringToMaybeSafeStruct(strDate);
    if(maybeSafeStruct) {
        return {
            numeric: structToNumeric(maybeSafeStruct),
            structured: maybeSafeStruct,
            textual: structToString(maybeSafeStruct)
        }
    } else return null;
}

export function shift(date, shiftFactor) {
    const shiftedNumeric = date.numeric + shiftFactor;
    const shiftedStruct = numericToUnsafeStruct(shiftedNumeric);
    const validStructure = toMaybeValidStructure(shiftedStruct)
    if(validStructure) {
        return {
            numeric: shiftedNumeric,
            structured: validStructure,
            textual: structToString(validStructure)
        }
    } else return null;
}