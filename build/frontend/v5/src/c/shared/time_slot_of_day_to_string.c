#include "./time_slot_of_day_to_string.h"
#include "./time_slot_of_day.h"

#include "./string_copy.h"
#include "./small_int_on_two_digits.h"


static void time_to_string(TimeSlotOfDay source, char* str) {
    small_int_on_two_digits(time_slot_of_day_get_hour(source), str);
    small_int_on_two_digits(time_slot_of_day_get_minute(source), str+3);
    str[2] = '\0';
    str[5] = '\0';
}


void time_slot_of_day_to_string(TimeSlotOfDay source, char* str) {
    if(time_slot_of_day_is_fullday(source)) {
        string_copy(str, "fullday");
    } else if(time_slot_of_day_is_afternoon(source)) {
        string_copy(str, "afternoon");
    } else if(time_slot_of_day_is_morning(source)) {
        string_copy(str, "morning");
    } else {
        time_to_string(source, str);
    }
}
