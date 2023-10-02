#ifndef APP_DYNAMIC_SERIES
#define APP_DYNAMIC_SERIES

#include "./string_series.h"
#include "./numeric_series.h"

#define series_create(S) _Generic((S),\
    NumericSeries* : numeric_series_create,\
    StringSeries* : string_series_create\
)(S)

#define series_init(S,s) _Generic((S),\
    NumericSeries* : numeric_series_zeros,\
    StringSeries* : string_series_blanks\
)(S,s)

#define series_dispose(S) _Generic((S),\
    const NumericSeries* : numeric_series_dispose,\
    const StringSeries* : string_series_dispose\
)(S)

#define series_get(S,...) _Generic((S),\
    const NumericSeries* : numeric_series_get,\
    NumericSeries* : numeric_series_get,\
    const StringSeries* : string_series_get,\
    StringSeries* : string_series_get\
)(S,__VA_ARGS__)

#define series_set(S,...) _Generic((S),\
    const NumericSeries* : numeric_series_set,\
    const StringSeries* : string_series_set,\
    NumericSeries* : numeric_series_set,\
    StringSeries* : string_series_set\
)(S,__VA_ARGS__)

#define series_push(S,...) _Generic((S),\
    const NumericSeries* : numeric_series_push,\
    const StringSeries* : string_series_push,\
    NumericSeries* : numeric_series_push,\
    StringSeries* : string_series_push\
)(S,__VA_ARGS__)

#define series_size(S) _Generic((S),\
    const NumericSeries* : numeric_series_size,\
    const StringSeries* : string_series_size,\
    NumericSeries* : numeric_series_size,\
    StringSeries* : string_series_size\
)(S)

#endif
