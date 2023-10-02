#include "./dataframe.h"

#include "./string_series.h"
#include "./numeric_series.h"
#include "../shared/unsafe/positive_int_to_unsigned_int.h"

#include "../js_library/js_library.h"


int dataframe_create_empty(Dataframe* dataframe) {
    const int pointer = app_dataframe_create_empty();
    if(pointer) {
        (dataframe -> resource).external_id = pointer;
        return 0;
    } else {
        return 1;
    }
}

unsigned int dataframe_append_string_column(const Dataframe* dataframe, const char* column_name, const StringSeries* series) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int column_index = app_dataframe_append_column(
        df_pointer,
        column_name,
        (series -> resource).external_id
    );
    return positive_int_to_unsigned_int(column_index);
}

unsigned int dataframe_append_numeric_column(const Dataframe* dataframe, const char* column_name, const NumericSeries* series) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int column_index = app_dataframe_append_column(
        df_pointer,
        column_name,
        (series -> resource).external_id
    );
    return positive_int_to_unsigned_int(column_index);
}

int dataframe_get_string_column_at_index(const Dataframe* dataframe, const unsigned int column_index, StringSeries* target) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int series_pointer = app_get_column_at_index(
        df_pointer,
        column_index
    );
    if(series_pointer) {
        (target -> resource).external_id = series_pointer;
        return 0;
    } else {
        return 1;
    }
}

int dataframe_get_numeric_column_at_index(const Dataframe* dataframe, const unsigned int column_index, NumericSeries* target) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int series_pointer = app_get_column_at_index(
        df_pointer,
        column_index
    );
    if(series_pointer) {
        (target -> resource).external_id = series_pointer;
        return 0;
    } else {
        return 1;
    }
}


int dataframe_select_string_isin(const Dataframe* dataframe, const unsigned int column_index, const StringSeries* filter, Dataframe* target) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int dfPointer = app_select_with_isin(
        df_pointer,
        column_index,
        (filter -> resource).external_id
    );
    if(dfPointer) {
        (target -> resource).external_id = dfPointer;
        return 0;
    } else {
        return 1;
    }
}

int dataframe_select_numeric_isin(const Dataframe* dataframe, const unsigned int column_index, const NumericSeries* filter, Dataframe* target) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int dfPointer = app_select_with_isin(
        df_pointer,
        column_index,
        (filter -> resource).external_id
    );
    if(dfPointer) {
        (target -> resource).external_id = dfPointer;
        return 0;
    } else {
        return 1;
    }
}

int dataframe_reindex(const Dataframe* dataframe, const unsigned int column_index, Dataframe* target) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int dfPointer = app_dataframe_reindex(
        df_pointer,
        column_index
    );
    if(dfPointer) {
        (target -> resource).external_id = dfPointer;
        return 0;
    } else {
        return 1;
    }
}
