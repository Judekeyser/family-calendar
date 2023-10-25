#ifndef APP_SHARED_TIME_SLOT_STRING
#define APP_SHARED_TIME_SLOT_STRING

#include "./time_slot_of_day.h"


typedef struct {
    char _1[10];
} TimeSlotString;

#define TIME_SLOT_STRING_SPREAD(var) UNWRAP(var), 10


TimeSlotOfDay time_slot_string_to_time_slot_of_day(TimeSlotString* time_slot_string);

void time_slot_string_from_time_slot_of_day(const TimeSlotOfDay time_slot_of_day, TimeSlotString* time_slot_string);

void time_slot_string_initialize_from_buffer(const char* buffer, TimeSlotString* time_slot_string);

const char* time_slot_string_open_buffer(const TimeSlotString* time_slot_string);

#endif
