#ifndef APP_DYNAMIC_DATAFRAME
#define APP_DYNAMIC_DATAFRAME

#include "./string_series.h"
#include "./numeric_series.h"


#define     STRDATE_COLUMN_INDEX 0
#define     STRTIME_COLUMN_INDEX 1
#define      UNREAD_COLUMN_INDEX 2
#define    ISDAYOFF_COLUMN_INDEX 3
#define DESCRIPTION_COLUMN_INDEX 4
#define      DETAIL_COLUMN_INDEX 5


#include "./__resource.h"
struct Dataframe {
    struct ResourceStruct resource;
};
typedef struct Dataframe Dataframe;


int dataframe_create_empty(Dataframe* dataframe);

unsigned int dataframe_append_string_column(const Dataframe* dataframe, const char* column_name, const StringSeries* series);

unsigned int dataframe_append_numeric_column(const Dataframe* dataframe, const char* column_name, const NumericSeries* series);

// This macro is for convenience and allows generic expression selection at compile-time
#define dataframe_append_column(self,columnname,series) _Generic((series),\
    const StringSeries*: dataframe_append_string_column,\
    const NumericSeries*: dataframe_append_numeric_column\
)(self,columnname,series)

int dataframe_get_string_column_at_index(const Dataframe* dataframe, const unsigned int column_index, StringSeries* target);

int dataframe_get_numeric_column_at_index(const Dataframe* dataframe, const unsigned int column_index, NumericSeries* target);

// This macro is for convenience and allows generic expression selection at compile-time
#define dataframe_get_column_at_index(self,columnindex,target) _Generic((target),\
    const StringSeries*: dataframe_get_string_column_at_index,\
    const NumericSeries*: dataframe_get_numeric_column_at_index,\
    StringSeries*: dataframe_get_string_column_at_index,\
    NumericSeries*: dataframe_get_numeric_column_at_index\
)(self,columnindex,target)

int dataframe_select_string_isin(const Dataframe* dataframe, const unsigned int column_index, const StringSeries* filter, Dataframe* target);

int dataframe_select_numeric_isin(const Dataframe* dataframe, const unsigned int column_index, const NumericSeries* filter, Dataframe* target);

// This macro is for convenience and allows generic expression selection at compile-time
#define dataframe_select_isin(self,columnidx,filter,target) _Generic((filter),\
    const StringSeries*: dataframe_select_string_isin,\
    const NumericSeries*: dataframe_select_numeric_isin,\
    StringSeries*: dataframe_select_string_isin,\
    NumericSeries*: dataframe_select_numeric_isin\
)(self,columnidx,filter,target)

int dataframe_reindex(const Dataframe* dataframe, const unsigned int column_index, Dataframe* target);

#endif
