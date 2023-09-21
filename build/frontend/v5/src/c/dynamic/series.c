#include "./series.h"

#include "../js_library/js_library.h"


void series_create(Series* series) {
    const int pointer = app_series_create();
    if(pointer) {
        (*series) -> external_id = pointer;
    } else {
        *series = 0;
    }
}

void series_dispose(const Series series) {
    app_series_dispose(series -> external_id);
}

int series_get_as_int(const Series series, const unsigned int index) {
    return app_series_get_as_int(series -> external_id, index);
}

void series_set_int(const Series series, const unsigned int index, const int value) {
    app_series_set_int(series -> external_id, index, value);
}

void series_push_int(const Series series, const int value) {
    app_series_push_int(series -> external_id, value);
}

int series_size(const Series series) {
    return app_series_size(series -> external_id);
}