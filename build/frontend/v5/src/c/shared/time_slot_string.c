#include "./time_slot_string.h"

#include "./assert.h"
#include "./string_equals.h"
#include "./string_copy.h"
#include "./time_slot_of_day.h"
#include "./small_int_on_two_digits.h"
#include "./unsafe/positive_int_to_unsigned_int.h"


static unsigned int int_value_of_digit(const char character) {
    return character >= '0' ? (
        character <= '9' ? positive_int_to_unsigned_int(character - '0') : 9
    ) : 0;
}


TimeSlotOfDay time_slot_string_to_time_slot_of_day(TimeSlotString* time_slot_string) {
    char* buffer = UNWRAP(*time_slot_string);
    
    if(string_equals(buffer, "afternoon")) {
        return time_slot_of_day_create_afternoon();
    } else if(string_equals(buffer, "morning")) {
        return time_slot_of_day_create_morning();
    } else if(string_equals(buffer, "fullday")) {
        return time_slot_of_day_create_fullday();
    } else {
        const unsigned int numeric_hour = (
            int_value_of_digit(buffer[0]) * 10 + int_value_of_digit(buffer[1])
        );
        const unsigned int numeric_minute = (
            int_value_of_digit(buffer[3]) * 10 + int_value_of_digit(buffer[4])
        );
        return time_slot_of_day_create_time(numeric_hour, numeric_minute);
    }
}

void time_slot_string_from_time_slot_of_day(const TimeSlotOfDay time_slot_of_day, TimeSlotString* time_slot_string) {
    char* buffer = UNWRAP(*time_slot_string);
    if(time_slot_of_day_is_fullday(time_slot_of_day)) {
        string_copy(buffer, "fullday");
    } else if(time_slot_of_day_is_morning(time_slot_of_day)) {
        string_copy(buffer, "morning");
    } else if(time_slot_of_day_is_afternoon(time_slot_of_day)) {
        string_copy(buffer, "afternoon");
    } else {
        const unsigned int minute = time_slot_of_day_get_minute(time_slot_of_day);
        const unsigned int hour = time_slot_of_day_get_hour(time_slot_of_day);

        small_int_on_two_digits(hour, buffer);
        small_int_on_two_digits(minute, buffer+3);
        buffer[2] = ':';
        buffer[5] = '\0';
    }
}

void time_slot_string_initialize_from_buffer(const char* buffer, TimeSlotString* time_slot_string) {
    char* sink = UNWRAP(*time_slot_string);
    for(unsigned int size = 9; size--;)
        sink[size] = buffer[size];
    sink[9] = '\0';
}

const char* time_slot_string_open_buffer(const TimeSlotString* time_slot_string) {
    return UNWRAP(*time_slot_string);
}
