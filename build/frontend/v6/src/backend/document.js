import {parseDate, shift} from "./date";

function computeDocument(url) {
    var path,                       // The path passed in the url through `path` key
        focusDate,                  // The date passed in the url through `focusdate` key
        focusDate_nextWeek,         // the date 1 week after `focusdate`
        focusDate_previousWeek,     // the date 1 week before `focusdate`
        focusDate_nextDay,          // the date 1 day after `focusdate`
        focusDate_previousDay,      // the date 1 day before `focusdate`
        document = {};

    focusDate = parseDate(url.get("focusdate") || "");
    path = url.get("path") || "";

    if(focusDate) {
        focusDate_nextWeek = shift(focusDate, 7);
        focusDate_previousWeek = shift(focusDate, -7);
        focusDate_nextDay = shift(focusDate, 1);
        focusDate_previousDay = shift(focusDate, -1);
    }

    /* Set date-based-navigation of document */
    {
        let nextWeekUrl, previousWeekUrl;
        switch(path) {
            case "calendar-grid": {
                nextWeekUrl = focusDate_nextWeek ? new URLSearchParams(url) : null;
                nextWeekUrl.set("focusdate", focusDate_nextWeek.textual);

                previousWeekUrl = focusDate_previousWeek ? new URLSearchParams(url) : null;
                previousWeekUrl.set("focusdate", focusDate_previousWeek.textual);
            } break;
        }
        document["date-based-navigation"] = {
            "displayed-date": focusDate?.textual,
            "next-date": nextWeekUrl && (() => navigate(nextWeekUrl)),
            "previous-date": previousWeekUrl && (() => navigate(previousWeekUrl)),
        }
    }

    return document;
}

export default computeDocument;