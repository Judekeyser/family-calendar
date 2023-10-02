#ifndef APP_DYNAMIC_STRING_SERIES
#define APP_DYNAMIC_STRING_SERIES

#include "./__resource.h"
struct StringSeries {
    struct ResourceStruct resource;
};
typedef struct StringSeries StringSeries;


int string_series_create(StringSeries* series);

int string_series_blanks(StringSeries* series, const unsigned int size);

void string_series_dispose(const StringSeries* series);

int string_series_get(const StringSeries* series, const unsigned int index, char* target, const unsigned int capacity);

void string_series_set(const StringSeries* series, const unsigned int index, const char* string);

void string_series_push(const StringSeries* series, const char* string);

unsigned int string_series_size(const StringSeries* series);

#endif
