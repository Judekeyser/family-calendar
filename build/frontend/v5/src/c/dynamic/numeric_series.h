#ifndef APP_DYNAMIC_NUMERIC_SERIES
#define APP_DYNAMIC_NUMERIC_SERIES

typedef struct NumericSeries NumericSeries;

struct NumericSeriesPrototype {
    int(*get)(const NumericSeries* self, const unsigned int index);
    void(*set)(const NumericSeries* self, const unsigned int index, const int value);
    void(*push)(const NumericSeries* sef, const int value);
    unsigned int(*size)(const NumericSeries* series);
    struct ResourceStruct(*as_column)(const NumericSeries* series);
};

#include "./__resource.h"
struct NumericSeries {
    struct ResourceStruct resource;
    const struct NumericSeriesPrototype* __proto__;
};

int numeric_series_create(NumericSeries* series);

int numeric_series_zeros(NumericSeries* series, const unsigned int size);

#include "./dataframe.h"

int numeric_series_from_column(NumericSeries* series, const Dataframe* dataframe, const unsigned int column_index);

#endif
