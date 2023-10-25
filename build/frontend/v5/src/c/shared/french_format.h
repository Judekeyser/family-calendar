#ifndef APP_SHARED_FRENCH_FORMAT
#define APP_SHARED_FRENCH_FORMAT


#include "./days_since_epoch.h"
#include "./time_slot_of_day.h"


typedef enum {
    MONTH_ONLY_PATTERN,
    LONG_DATE_TIME_IDENTIFIER,
    LONG_TIME_IDENTIFIER,
    LONG_DATE
} FrenchFormatTemplate;


typedef struct {
    unsigned int template;
    unsigned char capitalize;
    char buffer[100];
} FrenchFormat;

void french_format_use_pattern(FrenchFormat* format, const FrenchFormatTemplate template, const unsigned char capitalize);

const char* french_format_set(FrenchFormat* format, const DaysFromEpoch* days_from_epoch, const TimeSlotOfDay* time_slot_of_day);

const char* french_format_get(const FrenchFormat* format);

#endif
