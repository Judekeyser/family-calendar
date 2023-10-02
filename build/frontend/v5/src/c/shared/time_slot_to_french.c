#include "./time_slot_to_french.h"
#include "./time_slot_of_day.h"

#include "./assert.h"
#include "./string_copy.h"
#include "./string_length.h"
#include "./small_int_on_one_digit.h"
#include "./small_int_on_two_digits.h"


static const char* const MORNING = "Au matin";
static const char* const AFTERNOON = "En après-midi";
static const char* const FULLDAY = "Toute la jounée";


static void time_to_french(TimeSlotOfDay time_slot, char* target) {
    const unsigned int hour = time_slot_of_day_get_hour(time_slot);
    const unsigned int minute = time_slot_of_day_get_minute(time_slot);

    if(hour < 10) {
        small_int_on_one_digit(hour, target);
        target[1] = ':';
        target += 2;
    } else {
        small_int_on_two_digits(hour, target);
        target[2] = ':';
        target += 3;
    }

    small_int_on_two_digits(minute, target);
    target[2] = '\0';
}


void time_slot_to_french(TimeSlotOfDay time_slot, const unsigned int capitalize, char* target) {
    if(time_slot_of_day_is_fullday(time_slot)) {
        string_copy(target, FULLDAY);
        if(!capitalize) {
            target[0] = 't';
        }
    } else if(time_slot_of_day_is_afternoon(time_slot)) {
        string_copy(target, AFTERNOON);
        if(!capitalize) {
            target[0] = 'a';
        }
    } else if(time_slot_of_day_is_morning(time_slot)) {
        string_copy(target, MORNING);
        if(!capitalize) {
            target[0] = 't';
        }
    } else {
        if(capitalize) {
            string_copy(target, "À ");
        } else {
            string_copy(target, "à ");
        }
        time_to_french(time_slot, target + string_length(target));
    }

    assert(string_length(target) < TIME_SLOT_TO_FRENCH_TARGET_BUFFER_UPPER_BOUND, "Trying to render a time that is way too long");
}
