#include "./numeric_series.h"

#include "../js_library/js_library.h"


int numeric_series_create(NumericSeries* series) {
    const int pointer = app_series_create();
    if(pointer) {
        (series -> resource).external_id = pointer;
        return 0;
    } else {
        return 1;
    }
}

int numeric_series_zeros(NumericSeries* series, const unsigned int size) {
    const int pointer = app_series_zeros(size);
    if(pointer) {
        (series -> resource).external_id = pointer;
        return 0;
    } else {
        return 1;
    }
}

int numeric_series_get(const NumericSeries* series, const unsigned int index) {
    return app_series_get_as_int((series -> resource).external_id, index);
}

void numeric_series_set(const NumericSeries* series, const unsigned int index, const int value) {
    app_series_set_int((series -> resource).external_id, index, value);
}

void numeric_series_push(const NumericSeries* series, const int value) {
    app_series_push_int((series -> resource).external_id, value);
}

unsigned int numeric_series_size(const NumericSeries* series) {
    return app_series_size((series -> resource).external_id);
}
