function __dayOfWeek(datetime) {
    return new Date(datetime).getUTCDay()
}
function dateTimeToString(dateTime) {
    let date = new Date(dateTime);
    let isoString = date.toISOString()

    return isoString.substring(0, "YYYY-MM-DD".length)
}
function nextDateTime(dateTime) {
    let currentDay = __dayOfWeek(dateTime)
    while(__dayOfWeek(dateTime) === currentDay)
        dateTime += 1000 * 60 * 60 * 12;
    return dateTime;
}
function nextWeekDateTime(dateTime) {
    let currentDay = __dayOfWeek(dateTime)
    dateTime += 1000 * 60 * 60 * 24 * 6;
    while(__dayOfWeek(dateTime) !== currentDay) {
        dateTime += 1000 * 60 * 60 * 12;
    }
    return dateTime;
}
function previousWeekDateTime(dateTime) {
    let currentDay = __dayOfWeek(dateTime)
    dateTime -= 1000 * 60 * 60 * 24 * 6;
    while(__dayOfWeek(dateTime) !== currentDay)
        dateTime -= 1000 * 60 * 60 * 12;
    return dateTime;
}
function mondayOfDateTime(dateTime) {
    while(__dayOfWeek(dateTime) !== 1)
        dateTime -= 1000 * 60 * 60 * 24;
    return dateTime;
}
function stringToDateTime(strDate) {
    return Date.parse(strDate);
}

function dayOfDate(strDate) {
    return strDate.substring(8, 10)
}
function monthOfDate(strDate) {
    return strDate.substring(5, 7)
}
function yearOfDate(strDate) {
    return strDate.substring(0, 4)
}

function strTimeSorting(a, b) {
    if(a == b) return 0;
    if(a == "fullday") return -1;
    if(b == "fullday") return 1;
    if(a == "morning") return -1;
    if(b == "morning") return 1;
    if(a == "afternoon") return b < "12:00" ? 1: -1;
    if(b == "afternoon") return a < "12:00" ? -1: 1;
    return a <= b ? -1 : 1;
}

function recordSorting(a, b) {
    if(a.strDate === b.strDate)
        return strTimeSorting(a.strTime, b.strTime)
    return a.strDate <= b.strDate ? -1 : 1;
}

function strTimeOverlap(a, b) {
    if(a == b) return true
    if(a == "fullday") return true
    if(b == "fullday") return true
    if(a == "morning") {
        if(b == "afternoon") return false
        else return b < "12:00"
    }
    if(b == "morning") {
        if(a == "afternoon") return false
        else return a < "12:00"
    }
    if(a == "afternoon") return b >= "12:00"
    if(b == "afternoon") return a >= "12:00"
    return false
}


export {
    dateTimeToString,
    nextDateTime,
    previousWeekDateTime,
    nextWeekDateTime,
    mondayOfDateTime,
    stringToDateTime,
    dayOfDate,
    monthOfDate,
    yearOfDate,
    strTimeSorting,
    strTimeOverlap,
    recordSorting
}