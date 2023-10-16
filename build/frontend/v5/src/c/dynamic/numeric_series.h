#ifndef APP_DYNAMIC_NUMERIC_SERIES
#define APP_DYNAMIC_NUMERIC_SERIES

#include "./__resource.h"
struct NumericSeries {
    struct ResourceStruct resource;
};
typedef struct NumericSeries NumericSeries;


int numeric_series_create(NumericSeries* series);

int numeric_series_zeros(NumericSeries* series, const unsigned int size);

int numeric_series_get(const NumericSeries* series, const unsigned int index);

void numeric_series_set(const NumericSeries* series, const unsigned int index, const int value);

void numeric_series_push(const NumericSeries* series, const int value);

unsigned int numeric_series_size(const NumericSeries* series);

#endif
