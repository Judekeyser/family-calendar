#include "./date_string_series.h"

#include "../shared/date_string.h"
#include "./string_series.h"

#include "../js_library/js_library.h"
#include "../shared/assert.h"

static int date_string_series_get(const DateStringSeries* series, const unsigned int index, DateString* target) {
    DateString temp;
    int result = app_series_get_as_string((series -> resource).external_id, index, DATE_STRING_SPREAD(temp));
    *target = temp;
    return result;
}

static void date_string_series_set(const DateStringSeries* series, const unsigned int index, const DateString* date_string) {
    const char* string = date_string_open_buffer(date_string);
    app_series_set_string((series -> resource).external_id, index, string);
}

static void date_string_series_push(const DateStringSeries* series, const DateString* date_string) {
    const char* string = date_string_open_buffer(date_string);
    app_series_push_string((series -> resource).external_id, string);
}

static unsigned int date_string_series_size(const DateStringSeries* series) {
    return app_series_size((series -> resource).external_id);
}

static struct ResourceStruct date_string_series_as_column(const DateStringSeries* series) {
    return series -> resource;
}

static const struct DateStringPrototype JS_PROTOTYPE = {
    .get = date_string_series_get,
    .set = date_string_series_set,
    .push = date_string_series_push,
    .size = date_string_series_size,
    .as_column = date_string_series_as_column
};

static void date_string_series_wrap(DateStringSeries* series, const struct ResourceStruct resource) {
    series -> resource = resource;
    series -> __proto__ = &JS_PROTOTYPE;
}


int date_string_series_create(DateStringSeries* series) {
    const int pointer = app_series_blanks(0);
    if(pointer) {
        struct ResourceStruct resource = { .external_id = pointer };
        date_string_series_wrap(series, resource);
        return 0;
    } else {
        return 1;
    }
}
