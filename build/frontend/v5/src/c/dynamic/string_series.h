#ifndef APP_DYNAMIC_STRING_SERIES
#define APP_DYNAMIC_STRING_SERIES

typedef struct StringSeries StringSeries;

struct StringSeriesPrototype {
    int(*get)(const StringSeries* self, const unsigned int index, char* target, const unsigned int capacity);
    void(*set)(const StringSeries* self, const unsigned int index, const char* string);
    void(*push)(const StringSeries* self, const char* string);
    unsigned int(*size)(const StringSeries* self);
    struct ResourceStruct(*as_column)(const StringSeries* self);
};


#include "./__resource.h"
struct StringSeries {
    struct ResourceStruct resource;
    const struct StringSeriesPrototype* __proto__;
};

int string_series_create(StringSeries* series);

int string_series_blanks(StringSeries* series, const unsigned int size);

#include "./dataframe.h"

int string_series_from_column(StringSeries* series, const Dataframe* dataframe, const unsigned int column_index);

#endif
