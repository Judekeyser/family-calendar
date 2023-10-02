#ifndef APP_SHARED_TIME_SLOT_OF_DAY
#define APP_SHARED_TIME_SLOT_OF_DAY


typedef unsigned short time_slot_of_day_T;
typedef struct {
    time_slot_of_day_T _1;
} TimeSlotOfDay;


TimeSlotOfDay time_slot_of_day_create_time(unsigned int hour, unsigned int minute);

TimeSlotOfDay time_slot_of_day_create_fullday(void);

TimeSlotOfDay time_slot_of_day_create_morning(void);

TimeSlotOfDay time_slot_of_day_create_afternoon(void);

unsigned int time_slot_of_day_get_minute(TimeSlotOfDay time_slot);

unsigned int time_slot_of_day_get_hour(TimeSlotOfDay time_slot);

unsigned int time_slot_of_day_is_fullday(TimeSlotOfDay time_slot);

unsigned int time_slot_of_day_is_afternoon(TimeSlotOfDay time_slot);

unsigned int time_slot_of_day_is_morning(TimeSlotOfDay time_slot);

#endif
