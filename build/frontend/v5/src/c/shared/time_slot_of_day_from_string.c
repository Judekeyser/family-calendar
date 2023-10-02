#include "./time_slot_of_day_from_string.h"
#include "./time_slot_of_day.h"

#include "./assert.h"

#include "./string_equals.h"
#include "./string_length.h"
#include "./string_copy.h"
#include "./small_int_from_string.h"


TimeSlotOfDay time_slot_of_day_from_string(const char* str) {
    char str_time_slot[10]; /* afternoon+NUL */
    assert(string_length(str_time_slot) <= 10, "time_slot_of_day_from_string Provided string length is too long");
    if(string_length(str) <= 10) {
        string_copy(str_time_slot, str);

        if(string_equals(str_time_slot, "afternoon")) {
            return time_slot_of_day_create_afternoon();
        } else if(string_equals(str_time_slot, "fullday")) {
            return time_slot_of_day_create_fullday();
        } else if(string_equals(str_time_slot, "morning")) {
            return time_slot_of_day_create_morning();
        } else {
            str_time_slot[2] = '\0';
            str_time_slot[5] = '\0';

            const unsigned int numeric_hour = small_int_from_string(str_time_slot);
            const unsigned int numeric_minute = small_int_from_string(str_time_slot + 3);

            return time_slot_of_day_create_time(numeric_hour, numeric_minute);
        }
    } else {
        return time_slot_of_day_create_time(0u, 0u);
    }
}
