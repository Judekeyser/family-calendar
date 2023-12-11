#ifndef TIME
#define TIME

#include "../string/api.h"
#include "../types/api.h"


typedef struct
{
     Short value;
} SecondsInDay;

typedef enum
{
    PUNCTUAL,
    MORNING,
    AFTERNOON,
    FULL_DAY
} TimeWindow;

typedef struct
{
    TimeWindow window;
    SecondsInDay seconds_in_day;
} Time;

typedef struct
{
    char data[9];
    Size size;
} TimeString;

Time time_from_string(const String *string);

void time_to_string(const Time *time, TimeString *time_string);

#endif
