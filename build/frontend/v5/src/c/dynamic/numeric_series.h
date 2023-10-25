#ifndef APP_DYNAMIC_NUMERIC_SERIES
#define APP_DYNAMIC_NUMERIC_SERIES

typedef struct NumericSeries NumericSeries;
#include "./__resource.h"

struct NumericSeriesPrototype {
    void(*fill)(NumericSeries* self, const unsigned int size);
    void(*wrap)(NumericSeries* self, const struct ResourceStruct resource);

    int(*get)(const NumericSeries* self, const unsigned int index);
    void(*set)(const NumericSeries* self, const unsigned int index, const int value);
    void(*push)(const NumericSeries* sef, const int value);
    unsigned int(*size)(const NumericSeries* series);
    struct ResourceStruct(*as_column)(const NumericSeries* series);
};

struct NumericSeries {
    struct ResourceStruct resource;
    const struct NumericSeriesPrototype* __proto__;
};

#define NumericSeries_init(...) numeric_series_create(__VA_ARGS__);
void numeric_series_create(NumericSeries* series);

#endif
