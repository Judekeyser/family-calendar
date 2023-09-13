#ifndef __APP_ROUTE_CALENDAR__
#define __APP_ROUTE_CALENDAR__

int route_calendar_guard(const char* url_segments);

int route_calendar_handle_query_parameter(const char* key, const char* value);

void route_calendar_terminate(void);

#endif