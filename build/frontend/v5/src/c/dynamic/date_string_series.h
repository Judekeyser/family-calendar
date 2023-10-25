#ifndef APP_DYNAMIC_DATE_STRING_SERIES
#define APP_DYNAMIC_DATE_STRING_SERIES

#include "../shared/date_string.h"
typedef struct DateStringSeries DateStringSeries;
#include "./__resource.h"

struct DateStringPrototype {
    int(*get)(const DateStringSeries* self, const unsigned int index, DateString* target);
    void(*set)(const DateStringSeries* self, const unsigned int index, const DateString* string);
    void(*push)(const DateStringSeries* self, const DateString* string);
    unsigned int(*size)(const DateStringSeries* self);
    struct ResourceStruct(*as_column)(const DateStringSeries* self);
};


struct DateStringSeries {
    struct ResourceStruct resource;
    const struct DateStringPrototype* __proto__;
};

#define DateStringSeries_init(...) date_string_series_create(__VA_ARGS__)
int date_string_series_create(DateStringSeries* series);

#endif
