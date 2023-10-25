#include "./numeric_series.h"

#include "../shared/assert.h"
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

static void numeric_series_wrap(NumericSeries* series, const struct ResourceStruct resource) {
    series -> resource = resource;
}

void numeric_series_zeros(NumericSeries* series, const unsigned int size) {
    const int pointer = app_series_zeros(size);
    assert(pointer, "Issue while instantiating series of zeros");
    
    struct ResourceStruct resource = { .external_id = pointer };
    numeric_series_wrap(series, resource);
}

/* PROTOTYPE */

static const struct NumericSeriesPrototype JS_PROTOTYPE = {
    .fill = numeric_series_zeros,
    .wrap = numeric_series_wrap,

    .get = numeric_series_get,
    .set = numeric_series_set,
    .push = numeric_series_push,
    .size = numeric_series_size,
    .as_column = numeric_series_as_column
};

void numeric_series_create(NumericSeries* series) {
    series -> __proto__ = &JS_PROTOTYPE;
}
