#include "./route_appointment_form.h"

#include "../shared/prototypes.h"
#include "../shared/assert.h"
#include "../shared/string_length.h"
#include "../shared/string_equals.h"
#include "../shared/date_string.h"
#include "../shared/days_since_epoch.h"
#include "../shared/small_int_from_string.h"
#include "../dynamic/series.h"
#include "../dynamic/dataframe.h"
#include "../ioserver.h"

#include "../shared/unsafe/positive_int_to_unsigned_int.h"

#include "../template_engines/appointment_form_template.h"


struct RouteQueryParameters
{
    int dummy;
};

static struct RouteQueryParameters route_qp;

static int rectify_route_query_parameters(void)
{
    return 1;
}


int route_appointment_form_guard(const char* url_segments)
{
    log(url_segments);
    const char* cursor = url_segments;
    if(string_equals(cursor, "calendar")) {
        cursor += 1 + string_length(cursor);
        if(string_equals(cursor, "alter")) {
            return 1;
        }
    }
    return 0;
}

int route_appointment_form_handle_query_parameter(const char* key, const char* value)
{
    UNUSED(key); UNUSED(value);
    return 1;
}

void route_appointment_form_terminate(void)
{
    UNUSED(route_qp);
    if(rectify_route_query_parameters()) {
        appointment_form_template();
    }
}
