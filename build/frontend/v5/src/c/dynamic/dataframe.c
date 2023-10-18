#include "./dataframe.h"

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

unsigned int dataframe_append_column_series(
    const Dataframe* self,
    const char* column_name,
    const struct ResourceStruct series_resource
) {
    const int df_pointer = self ? ((self -> resource).external_id) : 0;
    const int column_index = app_dataframe_append_column(
        df_pointer,
        column_name,
        series_resource.external_id
    );
    return positive_int_to_unsigned_int(column_index);
}

int dataframe_get_resource_column_at_index(const Dataframe* dataframe, const unsigned int column_index, struct ResourceStruct* target) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int series_pointer = app_get_column_at_index(
        df_pointer,
        column_index
    );
    if(series_pointer) {
        struct ResourceStruct resource = { .external_id = series_pointer };
        *target = resource;
        return 0;
    } else {
        return 1;
    }
}

int dataframe_select_isin_resource(const Dataframe* dataframe, const unsigned int column_index, const struct ResourceStruct series_resource, Dataframe* target) {
    const int df_pointer = dataframe ? ((dataframe -> resource).external_id) : 0;
    const int dfPointer = app_select_with_isin(
        df_pointer,
        column_index,
        series_resource.external_id
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
