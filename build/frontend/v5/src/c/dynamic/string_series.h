#ifndef APP_DYNAMIC_STRING_SERIES
#define APP_DYNAMIC_STRING_SERIES

typedef struct StringSeries StringSeries;
#include "./__resource.h"

struct StringSeriesPrototype {
    void(*fill)(StringSeries* self, const unsigned int size);
    void(*wrap)(StringSeries* self, const struct ResourceStruct resource);

    int(*get)(const StringSeries* self, const unsigned int index, char* target, const unsigned int capacity);
    void(*set)(const StringSeries* self, const unsigned int index, const char* string);
    void(*push)(const StringSeries* self, const char* string);
    unsigned int(*size)(const StringSeries* self);
    struct ResourceStruct(*as_column)(const StringSeries* self);
};

struct StringSeries {
    struct ResourceStruct resource;
    const struct StringSeriesPrototype* __proto__;
};

#define StringSeries_init(...) string_series_create(__VA_ARGS__)
void string_series_create(StringSeries* series);

#endif
