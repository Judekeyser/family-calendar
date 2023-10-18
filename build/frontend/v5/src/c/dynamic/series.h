#ifndef APP_DYNAMIC_SERIES
#define APP_DYNAMIC_SERIES

#include "./string_series.h"
#include "./numeric_series.h"
#include "./date_string_series.h"

#define series_get(S,...) ((S) -> __proto__ -> get(S,__VA_ARGS__))
#define series_set(S,...) ((S) -> __proto__ -> set(S,__VA_ARGS__))
#define series_push(S,...) ((S) -> __proto__ -> push(S,__VA_ARGS__))
#define series_size(S) ((S) -> __proto__ -> size(S))
#define series_as_column(S) ((S) -> __proto__ -> as_column(S))

#endif
