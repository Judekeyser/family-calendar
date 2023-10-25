#include "./route_appointment_list_unread.h"

#include "../shared/date_string.h"
#include "../shared/string_equals.h"
#include "../shared/string_length.h"

#include "../template_engines/unread_appointments_template.h"


int route_appointment_list_unread_guard(const char* url_segments)
{
    if(string_equals(url_segments, "appointments")) {
        url_segments += 1 + string_length(url_segments);
        if(string_equals(url_segments, "unread")) {
            return 1;
        }
    }
    return 0;
}

int route_appointment_list_unread_handle_query_parameter(const char* key, const char* value)
{
    UNUSED(key);
    UNUSED(value);
    return 1;
}

void route_appointment_list_unread_terminate(void)
{
    unread_appointments_template();
}
