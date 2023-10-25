#ifndef APP_DYNAMIC_SERIES
#define APP_DYNAMIC_SERIES

#include "./string_series.h"
#include "./numeric_series.h"
#include "./date_string_series.h"
#include "./time_slot_string_series.h"

#define series_get(S,...) ((S) -> __proto__ -> get(S,__VA_ARGS__))
#define series_set(S,...) ((S) -> __proto__ -> set(S,__VA_ARGS__))
#define series_push(S,...) ((S) -> __proto__ -> push(S,__VA_ARGS__))
#define series_size(S) ((S) -> __proto__ -> size(S))
#define series_as_column(S) ((S) -> __proto__ -> as_column(S))

#define series_create_from_dataframe_column(T,S,df_ptr,idx) new(T,S); {\
    struct ResourceStruct resource; \
    dataframe_get_resource_column_at_index(df_ptr,idx,&resource); \
    (S.__proto__ -> wrap)(&S, resource); }

#define series_create_empty(T,S,...) new(T,S); { \
    (S.__proto__ -> fill)(&S,__VA_ARGS__); }

#endif
