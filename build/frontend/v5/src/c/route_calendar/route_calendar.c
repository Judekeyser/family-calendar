#include "./route_calendar.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"
#include "../shared/string_equals.h"
#include "../shared/days_since_epoch.h"
#include "../shared/date_from_string.h"
#include "../shared/small_int_from_string.h"
#include "../js_library/js_library.h"
#include "../ioserver.h"

#include "./grid_template.h"


struct RouteQueryParameters
{
    int weeks_count;
    struct DaysSinceEpoch focus_date;
    struct DaysSinceEpoch today_date;
    int focus_flag;
    int today_flag;
};

static struct RouteQueryParameters route_qp;

static int rectify_route_query_parameters()
{
    if(route_qp.weeks_count < 1) {
        route_qp.weeks_count = 1;
    } else if(route_qp.weeks_count > 5) {
        route_qp.weeks_count = 5;
    }

    if(!route_qp.today_flag) {
        return 0;
    }

    if(!route_qp.focus_flag) {
        assert(route_qp.today_flag, "rectify_route_query_parameters route_calendar. today_flag not set");
        route_qp.focus_flag = route_qp.today_flag;
        route_qp.focus_date = route_qp.today_date;
    }

    return 1;
}


int route_calendar_guard(const char* url_segments)
{
    const char* cursor = url_segments;
    if(!string_equals(cursor, "calendar")) {
        return 0;
    } else {
        cursor += 1 + string_length(cursor);
        if(string_length(cursor)) {
            route_qp.weeks_count = 0;
            route_qp.focus_flag = 0;
            route_qp.today_flag = 0;
            return 0;
        } else {
            return 1;
        }
    }
}

int route_calendar_handle_query_parameter(const char* key, const char* value)
{
    if(string_equals(key, "focus_date")) {
        route_qp.focus_flag = 1;
        date_from_string(value, &(route_qp.focus_date));
        return 1;
    } else if(string_equals(key, "today_date")) {
        route_qp.today_flag = 1;
        date_from_string(value, &(route_qp.today_date));
        return 1;
    } else if(string_equals(key, "weeks_count")) {
        route_qp.weeks_count = small_int_from_string(value);
        return 1;
    }
    return 0;
}

void route_calendar_terminate(void)
{
    if(rectify_route_query_parameters()) {
        grid_template_flush(
            route_qp.weeks_count,
            &(route_qp.focus_date),
            &(route_qp.today_date)
        );
    }
}
