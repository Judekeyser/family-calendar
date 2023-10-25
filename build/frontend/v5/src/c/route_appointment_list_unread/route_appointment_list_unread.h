#ifndef APP_ROUTE_APPOINTMENT_LIST_UNREAD
#define APP_ROUTE_APPOINTMENT_LIST_UNREAD

int route_appointment_list_unread_guard(const char* url_segments);

int route_appointment_list_unread_handle_query_parameter(const char* key, const char* value);

void route_appointment_list_unread_terminate(void);

#endif
