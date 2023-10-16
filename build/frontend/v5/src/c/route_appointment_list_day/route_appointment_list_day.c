#include "./route_appointment_list_day.h"

#include "../shared/date_string.h"
#include "../shared/string_equals.h"
#include "../shared/string_length.h"

#include "../template_engines/appointments_of_day_template.h"


struct RouteQueryParameters
{
    DaysFromEpoch focus_date;
    unsigned int focus_flag;
};

static struct RouteQueryParameters route_qp;


int route_appointment_list_day_guard(const char* url_segments)
{
    if(string_equals(url_segments, "appointments")) {
        url_segments += 1 + string_length(url_segments);
        if(string_equals(url_segments, "day")) {
            url_segments += 1 + string_length(url_segments);
            route_qp.focus_flag = 0;
            return 1;
        }
    }
    return 0;
}

int route_appointment_list_day_handle_query_parameter(const char* key, const char* value)
{
    if(string_equals(key, "focus_date")) {
        DateString date_string;
        date_string_initialize_from_buffer(value, &date_string);
        route_qp.focus_flag = 1;
        route_qp.focus_date = date_string_to_days_from_epoch(&date_string);
        return 1;
    }
    return 0;
}

void route_appointment_list_day_terminate(void)
{
    if(route_qp.focus_flag) {
        appointments_of_day_template(route_qp.focus_date);
    }
}
