#ifndef APP_ROUTE_APPOINTMENT_FORM
#define APP_ROUTE_APPOINTMENT_FORM

int route_appointment_form_guard(const char* url_segments);

int route_appointment_form_handle_query_parameter(const char* key, const char* value);

void route_appointment_form_terminate(void);

#endif
