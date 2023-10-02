#include "./time_slot_of_day.h"

#include "./assert.h"

/**
 * Note on the representation:
 *  There are not more than 60*12 minutes in one half of a day,
 *      which makes 720 minutes. This fits on 10 bits.
 *  "fullday" should come first in most cases,
 *  "morning" should come before 00:00
 *  "afternoon" should come before 12:00
 *
 *  This suggests to perform the follow representation:
 *      fullday -> 0000....00000001 = 1
 *      morning -> 0000000000000011 = 3
 *           AM -> 000[ 10 bits]111 between [5, 8191]
 *   afternoon  -> 0010000000000011 = 8195
 *           PM -> 001[ 10 bits]111 between [8199, 16383]
 *
 *  That takes 1+10+3=14 < 16 bits, hence a short.
 */


TimeSlotOfDay time_slot_of_day_create_time(unsigned int hour, unsigned int minute) {
    const unsigned int rectified_minutes = minute < 60u ? minute : 0u;
    unsigned int rectified_hours = hour < 24u ? hour : 0u;

    time_slot_of_day_T time_slot;
    if(rectified_hours >= 12u) {
        rectified_hours -= 12u;
        time_slot = 8199;
    } else {
        time_slot = 7;
    }
    const unsigned int time = rectified_hours * 60u + rectified_minutes;
    time_slot |= time << 3;

    TimeSlotOfDay result = WRAP(time_slot);
    return result;
}

TimeSlotOfDay time_slot_of_day_create_fullday(void) {
    TimeSlotOfDay result = WRAP(1);
    return result;
}

TimeSlotOfDay time_slot_of_day_create_morning(void) {
    TimeSlotOfDay result = WRAP(3);
    return result;
}

TimeSlotOfDay time_slot_of_day_create_afternoon(void) {
    TimeSlotOfDay result = WRAP(8195);
    return result;
}

unsigned int time_slot_of_day_get_minute(TimeSlotOfDay self) {
    time_slot_of_day_T time_slot = UNWRAP(self);
    assert((time_slot & 7) == 7, "Access to time_slot_of_day_get_minute on non `time` time slot");
    const unsigned int numeric = (time_slot & 8184) >> 3;
    const unsigned int minute = numeric % 60u;
    assert(minute < 60, "Recomputed minute goes out of the clock");
    return minute;
}

unsigned int time_slot_of_day_get_hour(TimeSlotOfDay self) {
    time_slot_of_day_T time_slot = UNWRAP(self);
    assert((time_slot & 7) == 7, "Access to time_slot_of_day_get_minute on non `time` time slot");
    const unsigned int numeric = (time_slot & 8184) >> 3;
    unsigned int hour = numeric / 60u;
    if(time_slot >= 8192) {
        hour += 12u;
    }
    assert(hour < 24, "Recomputed hour goes out of the clock");
    return hour;
}

unsigned int time_slot_of_day_is_fullday(TimeSlotOfDay self) {
    time_slot_of_day_T time_slot = UNWRAP(self);
    return time_slot == 1 ? 1u : 0u;
}

unsigned int time_slot_of_day_is_afternoon(TimeSlotOfDay self) {
    time_slot_of_day_T time_slot = UNWRAP(self);
    return time_slot == 8195 ? 1u: 0u;
}

unsigned int time_slot_of_day_is_morning(TimeSlotOfDay self) {
    time_slot_of_day_T time_slot = UNWRAP(self);
    return time_slot == 3 ? 1u: 0u;
}
