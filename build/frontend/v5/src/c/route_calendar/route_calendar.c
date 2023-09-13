#include "./route_calendar.h"

#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "../shared/string_equals.h"
#include "../shared/time_strdate_to_tm.h"
#include "../shared/debug.h"
#include "../js_library/js_library.h"
#include "../ioserver.h"

#include "./grid_template.h"


struct RouteQueryParameters
{
    int weeks_count;
    struct tm focus_tm;
    struct tm today_tm;
    time_t focus_timestamp_sec;
    time_t today_timestamp_sec;
};

static struct RouteQueryParameters route_qp;

static int rectify_route_query_parameters()
{
    LOG(
        "route_calendar terminates request. Ready to flush content:"
        "\n\tWeeks count: %d"
        "\n\tFocus date time (after rectification):"
        ,route_qp.weeks_count
    );
    LOG_IF(route_qp.focus_timestamp_sec,
        "\n\t\t(After) Date (w) Time -> %d-%d-%d (%d) %d:%d:%d"
        "\n\t\t(After) Epoch timestamp (in seconds) -> %ld"
        ,route_qp.focus_tm.tm_year + 1900
        ,route_qp.focus_tm.tm_mon + 1
        ,route_qp.focus_tm.tm_mday
        ,route_qp.focus_tm.tm_wday
        ,route_qp.focus_tm.tm_hour
        ,route_qp.focus_tm.tm_min
        ,route_qp.focus_tm.tm_sec
        ,(long int)route_qp.focus_timestamp_sec
    );
    LOG_ELSE(route_qp.focus_timestamp_sec,
        "%s", "\n\t\tNo information provided"
    )
    LOG(
        "%s",
        "\n\tToday date time (after rectification):"
    );
    LOG_IF(route_qp.today_timestamp_sec,
        "\n\t\t(After) Date (w) Time -> %d-%d-%d (%d) %d:%d:%d"
        "\n\t\t(After) Epoch timestamp (in seconds) -> %ld"
        ,route_qp.today_tm.tm_year + 1900
        ,route_qp.today_tm.tm_mon + 1
        ,route_qp.today_tm.tm_mday
        ,route_qp.today_tm.tm_wday
        ,route_qp.today_tm.tm_hour
        ,route_qp.today_tm.tm_min
        ,route_qp.today_tm.tm_sec
        ,(long int)route_qp.today_timestamp_sec
    );
    LOG_ELSE(route_qp.today_timestamp_sec,
        "%s", "\n\t\tNo information provided"
    )
    LOG_FLUSH

    if(route_qp.weeks_count < 1) {
        LOG(
            "Rectifying %d week counts to 1"
            ,route_qp.weeks_count
        )
        LOG_FLUSH
        route_qp.weeks_count = 1;
    } else if(route_qp.weeks_count > 5) {
        LOG("Rectifying %d week counts to 5", route_qp.weeks_count);
        LOG_FLUSH
        route_qp.weeks_count = 5;
    }

    if(!route_qp.today_timestamp_sec) {
        LOG(
            "%s"
            ,"Unprovided today date, although it is required"
        ) LOG_FLUSH
        return 0;
    }

    if(!route_qp.focus_timestamp_sec) {
        assert(route_qp.today_timestamp_sec);
        route_qp.focus_timestamp_sec = route_qp.today_timestamp_sec;
        route_qp.focus_tm = route_qp.today_tm;
        LOG(
            "%s", "Rectifying unprovided focus_date to today"
        ) LOG_FLUSH
    }

    return 1;
}


int route_calendar_guard(const char* url_segments)
{
    const char* cursor = url_segments;
    if(!string_equals(cursor, "calendar")) {
        return 0;
    } else {
        cursor += 1 + strlen(cursor);
        if(strlen(cursor)) {
            route_qp.weeks_count = 0;
            route_qp.focus_timestamp_sec = 0;
            route_qp.today_timestamp_sec = 0;
            return 0;
        } else {
            return 1;
        }
    }
}

int route_calendar_handle_query_parameter(const char* key, const char* value)
{
    if(string_equals(key, "focus_date")) {
        route_qp.focus_timestamp_sec = time_strdate_to_tm(value, &route_qp.focus_tm);
        return 1;
    } else if(string_equals(key, "today_date")) {
        route_qp.today_timestamp_sec = time_strdate_to_tm(value, &route_qp.today_tm);
        return 1;
    } else if(string_equals(key, "weeks_count")) {
        route_qp.weeks_count = atoi(value);
        return 1;
    }
    return 0;
}

void route_calendar_terminate(void)
{
    if(rectify_route_query_parameters()) {
        grid_template_flush(
            route_qp.weeks_count,
            &route_qp.focus_tm,
            &route_qp.today_tm
        );
    }
}
