#ifndef APP_ROUTE_APPOINTMENT_LIST_DAY
#define APP_ROUTE_APPOINTMENT_LIST_DAY

int route_appointment_list_day_guard(const char* url_segments);

int route_appointment_list_day_handle_query_parameter(const char* key, const char* value);

void route_appointment_list_day_terminate(void);

#endif
