#include "./string_series.h"

#include "../js_library/js_library.h"


int string_series_create(StringSeries* series) {
    const int pointer = app_series_create();
    if(pointer) {
        (series -> resource).external_id = pointer;
        return 0;
    } else {
        return 1;
    }
}

int string_series_blanks(StringSeries* series, const unsigned int size) {
    const int pointer = app_series_blanks(size);
    if(pointer) {
        (series -> resource).external_id = pointer;
        return 0;
    } else {
        return 1;
    }
}

int string_series_get(const StringSeries* series, const unsigned int index, char* target, const unsigned int capacity) {
    return app_series_get_as_string((series -> resource).external_id, index, target, capacity);
}

void string_series_set(const StringSeries* series, const unsigned int index, const char* string) {
    app_series_set_string((series -> resource).external_id, index, string);
}

void string_series_push(const StringSeries* series, const char* string) {
    app_series_push_string((series -> resource).external_id, string);
}

unsigned int string_series_size(const StringSeries* series) {
    return app_series_size((series -> resource).external_id);
}
