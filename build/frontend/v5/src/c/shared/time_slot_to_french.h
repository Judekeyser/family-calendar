#ifndef APP_SHARED_TIME_SLOT_TO_FRENCH
#define APP_SHARED_TIME_SLOT_TO_FRENCH

#include "./time_slot_of_day.h"

#define TIME_SLOT_TO_FRENCH_TARGET_BUFFER_UPPER_BOUND 20

void time_slot_to_french(TimeSlotOfDay time_slot, const unsigned int capitalize, char* target);

#endif
