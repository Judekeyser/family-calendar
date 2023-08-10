function dateTimeToString(dateTime) {
    let date = new Date(dateTime);
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();

    return year + '-' + (
            month < 10 ? '0' : ''
        ) + month + '-' + (
            day < 10 ? '0' : ''
        ) + day;
}
function nextDateTime(dateTime) {
    let currentDay = new Date(dateTime).getDay();
    while(new Date(dateTime).getDay() === currentDay)
        dateTime += 1000 * 60 * 60 * 12;
    return dateTime;
}
function nextWeekDateTime(dateTime) {
    let currentDay = new Date(dateTime).getDay();
    dateTime += 1000 * 60 * 60 * 24 * 6;
    while(new Date(dateTime).getDay() !== currentDay) {
        dateTime += 1000 * 60 * 60 * 12;
    }
    return dateTime;
}
function previousWeekDateTime(dateTime) {
    let currentDay = new Date(dateTime).getDay();
    dateTime -= 1000 * 60 * 60 * 24 * 6;
    while(new Date(dateTime).getDay() !== currentDay)
        dateTime -= 1000 * 60 * 60 * 12;
    return dateTime;
}
function mondayOfDateTime(dateTime) {
    while(new Date(dateTime).getDay() !== 1)
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