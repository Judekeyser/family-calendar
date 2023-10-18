#include "./numeric_series.h"

#include "../js_library/js_library.h"


static int numeric_series_get(const NumericSeries* self, const unsigned int index) {
    return app_series_get_as_int((self -> resource).external_id, index);
}

static void numeric_series_set(const NumericSeries* self, const unsigned int index, const int value) {
    app_series_set_int((self -> resource).external_id, index, value);
}

static void numeric_series_push(const NumericSeries* self, const int value) {
    app_series_push_int((self -> resource).external_id, value);
}

static unsigned int numeric_series_size(const NumericSeries* self) {
    return app_series_size((self -> resource).external_id);
}

static struct ResourceStruct numeric_series_as_column(const NumericSeries* self) {
    return self -> resource;
}

/* PROTOTYPE */

static const struct NumericSeriesPrototype JS_PROTOTYPE = {
    .get = numeric_series_get,
    .set = numeric_series_set,
    .push = numeric_series_push,
    .size = numeric_series_size,
    .as_column = numeric_series_as_column
};


static void numeric_series_wrap(NumericSeries* series, const struct ResourceStruct resource) {
    series -> resource = resource;
    series -> __proto__ = &JS_PROTOTYPE;
}

int numeric_series_create(NumericSeries* series) {
    return numeric_series_zeros(series, 0);
}

int numeric_series_zeros(NumericSeries* series, const unsigned int size) {
    const int pointer = app_series_zeros(size);
    if(pointer) {
        struct ResourceStruct resource = { .external_id = pointer };
        numeric_series_wrap(series, resource);
        return 0;
    } else {
        return 1;
    }
}

#include "./dataframe.h"

int numeric_series_from_column(NumericSeries* series, const Dataframe* dataframe, const unsigned int column_index) {
    struct ResourceStruct resource;
    int error = dataframe_get_resource_column_at_index(dataframe, column_index, &resource);
    if(error) {
        return error;
    } else {
        numeric_series_wrap(series, resource);
        return 0;
    }
}

