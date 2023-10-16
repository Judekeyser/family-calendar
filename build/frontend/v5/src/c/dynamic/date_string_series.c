#include "./date_string_series.h"

#include "../shared/date_string.h"
#include "./string_series.h"
#include "../js_library/js_library.h"


int date_string_series_create(DateStringSeries* series) {
    const int pointer = app_series_create();
    if(pointer) {
        (series -> resource).external_id = pointer;
        return 0;
    } else {
        return 1;
    }
}

int date_string_series_get(const DateStringSeries* series, const unsigned int index, DateString* target) {
    DateString temp;
    int result = app_series_get_as_string((series -> resource).external_id, index, DATE_STRING_SPREAD(temp));
    *target = temp;
    return result;
}

void date_string_series_set(const DateStringSeries* series, const unsigned int index, const DateString* date_string) {
    const char* string = date_string_open_buffer(date_string);
    app_series_set_string((series -> resource).external_id, index, string);
}

void date_string_series_push(const DateStringSeries* series, const DateString* date_string) {
    const char* string = date_string_open_buffer(date_string);
    app_series_push_string((series -> resource).external_id, string);
}

unsigned int date_string_series_size(const DateStringSeries* series) {
    return app_series_size((series -> resource).external_id);
}
