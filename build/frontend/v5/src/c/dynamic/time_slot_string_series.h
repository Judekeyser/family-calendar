#ifndef APP_DYNAMIC_TIME_SLOT_STRING_SERIES
#define APP_DYNAMIC_TIME_SLOT_STRING_SERIES

#include "../shared/time_slot_string.h"
typedef struct TimeSlotStringSeries TimeSlotStringSeries;
#include "./__resource.h"

struct TimeSlotStringPrototype {
    int(*get)(const TimeSlotStringSeries* self, const unsigned int index, TimeSlotString* target);
    void(*set)(const TimeSlotStringSeries* self, const unsigned int index, const TimeSlotString* string);
    void(*push)(const TimeSlotStringSeries* self, const TimeSlotString* string);
    unsigned int(*size)(const TimeSlotStringSeries* self);
    struct ResourceStruct(*as_column)(const TimeSlotStringSeries* self);
};


struct TimeSlotStringSeries {
    struct ResourceStruct resource;
    const struct TimeSlotStringPrototype* __proto__;
};

#define TimeSlotStringSeries_init(...) time_slot_string_series_create(__VA_ARGS__)
int time_slot_string_series_create(TimeSlotStringSeries* series);

#endif
