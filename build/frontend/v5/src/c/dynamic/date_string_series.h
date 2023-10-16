#ifndef APP_DYNAMIC_DATE_STRING_SERIES
#define APP_DYNAMIC_DATE_STRING_SERIES

#include "../shared/date_string.h"
#include "./__resource.h"
typedef struct {
    struct ResourceStruct resource;
} DateStringSeries;


int date_string_series_create(DateStringSeries* series);

int date_string_series_get(const DateStringSeries* series, const unsigned int index, DateString* target);

void date_string_series_set(const DateStringSeries* series, const unsigned int index, const DateString* string);

void date_string_series_push(const DateStringSeries* series, const DateString* string);

unsigned int date_string_series_size(const DateStringSeries* series);

#endif
