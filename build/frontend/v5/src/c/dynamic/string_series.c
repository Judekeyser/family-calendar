#include "./string_series.h"

#include "../js_library/js_library.h"

static int string_series_get(const StringSeries* series, const unsigned int index, char* target, const unsigned int capacity) {
    return app_series_get_as_string((series -> resource).external_id, index, target, capacity);
}

static void string_series_set(const StringSeries* series, const unsigned int index, const char* string) {
    app_series_set_string((series -> resource).external_id, index, string);
}

static void string_series_push(const StringSeries* series, const char* string) {
    app_series_push_string((series -> resource).external_id, string);
}

static unsigned int string_series_size(const StringSeries* series) {
    return app_series_size((series -> resource).external_id);
}

static struct ResourceStruct string_series_as_column(const StringSeries* series) {
    return series -> resource;
}

static const struct StringSeriesPrototype JS_PROTOTYPE = {
    .get = string_series_get,
    .set = string_series_set,
    .push = string_series_push,
    .size = string_series_size,
    .as_column = string_series_as_column
};


static void string_series_wrap(StringSeries* series, const struct ResourceStruct resource) {
    series -> resource = resource;
    series -> __proto__ = &JS_PROTOTYPE;
}

int string_series_blanks(StringSeries* series, const unsigned int size) {
    const int pointer = app_series_blanks(size);
    if(pointer) {
        struct ResourceStruct resource = { .external_id = pointer };
        string_series_wrap(series, resource);
        return 0;
    } else {
        return 1;
    }
}

int string_series_create(StringSeries* series) {
    return string_series_blanks(series, 0);
}

#include "./dataframe.h"

int string_series_from_column(StringSeries* series, const Dataframe* dataframe, const unsigned int column_index) {
    struct ResourceStruct resource;
    int error = dataframe_get_resource_column_at_index(dataframe, column_index, &resource);
    if(error) {
        return error;
    } else {
        string_series_wrap(series, resource);
        return 0;
    }
}
