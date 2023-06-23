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
        dateTime += 1000 * 60 * 60 * 24;
    return dateTime;
}
function previousDateTime(dateTime) {
    let currentDay = new Date(dateTime).getDay();
    while(new Date(dateTime).getDay() === currentDay)
        dateTime -= 1000 * 60 * 60 * 24;
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

function frenchMonthOfDate(strDate) {
    let french;
    switch(monthOfDate(strDate)) {
        case "01": { french = "Janvier" } break;
        case "02": { french = "Février" } break;
        case "03": { french = "Mars" } break;
        case "04": { french = "Avril" } break;
        case "05": { french = "Mai" } break;
        case "06": { french = "Juin" } break;
        case "07": { french = "Juillet" } break;
        case "08": { french = "Août" } break;
        case "09": { french = "Septembre" } break;
        case "10": { french = "Octobre" } break;
        case "11": { french = "Novembre" } break;
        case "12": { french = "Décembre" } break;
    }
    return french; 
}

function frenchDayOfDate(strDate) {
    let french;
    let day = dayOfDate(strDate);
    switch(day) {
        case "01": { french = "1er" } break;
        case "02": { french = "2" } break;
        case "03": { french = "3" } break;
        case "04": { french = "4" } break;
        case "05": { french = "5" } break;
        case "06": { french = "6" } break;
        case "07": { french = "7" } break;
        case "08": { french = "8" } break;
        case "09": { french = "9" } break;
        default: { french = day } break;
    }
    return french; 
}

function strTimeSorting(a, b) {
    if(a == b) return 0;
    if(a == "fullday") return -1;
    if(b == "fullday") return 1;
    if(a == "morning") return -1;
    if(b == "morning") return 1;
    if(a == "afternoon") return b < "12:00" ? 1: -1;
    if(b == "afternoon") return a < "12:00" ? -1: 1;
    return a < b ? -1 : 1;
}


export {
    dateTimeToString,
    nextDateTime,
    previousDateTime,
    mondayOfDateTime,
    stringToDateTime,
    dayOfDate,
    monthOfDate,
    yearOfDate,
    frenchMonthOfDate,
    frenchDayOfDate,
    strTimeSorting
}