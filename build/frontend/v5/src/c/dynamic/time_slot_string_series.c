#include "./time_slot_string_series.h"

#include "../shared/time_slot_string.h"
#include "./string_series.h"

#include "../js_library/js_library.h"
#include "../shared/assert.h"

static int time_slot_string_series_get(const TimeSlotStringSeries* series, const unsigned int index, TimeSlotString* target) {
    TimeSlotString temp;
    int result = app_series_get_as_string((series -> resource).external_id, index, TIME_SLOT_STRING_SPREAD(temp));
    *target = temp;
    return result;
}

static void time_slot_string_series_set(const TimeSlotStringSeries* series, const unsigned int index, const TimeSlotString* date_string) {
    const char* string = time_slot_string_open_buffer(date_string);
    app_series_set_string((series -> resource).external_id, index, string);
}

static void time_slot_string_series_push(const TimeSlotStringSeries* series, const TimeSlotString* date_string) {
    const char* string = time_slot_string_open_buffer(date_string);
    app_series_push_string((series -> resource).external_id, string);
}

static unsigned int time_slot_string_series_size(const TimeSlotStringSeries* series) {
    return app_series_size((series -> resource).external_id);
}

static struct ResourceStruct time_slot_string_series_as_column(const TimeSlotStringSeries* series) {
    return series -> resource;
}

static const struct TimeSlotStringPrototype JS_PROTOTYPE = {
    .get = time_slot_string_series_get,
    .set = time_slot_string_series_set,
    .push = time_slot_string_series_push,
    .size = time_slot_string_series_size,
    .as_column = time_slot_string_series_as_column
};

static void time_slot_string_series_wrap(TimeSlotStringSeries* series, const struct ResourceStruct resource) {
    series -> resource = resource;
    series -> __proto__ = &JS_PROTOTYPE;
}


int time_slot_string_series_create(TimeSlotStringSeries* series) {
    const int pointer = app_series_blanks(0);
    if(pointer) {
        struct ResourceStruct resource = { .external_id = pointer };
        time_slot_string_series_wrap(series, resource);
        return 0;
    } else {
        return 1;
    }
}
