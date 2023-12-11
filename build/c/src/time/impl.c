#include "./api.h"


Time time_from_string(const String *string)
{
    Time time = {
        .window=PUNCTUAL,
        .seconds_in_day={0u}
    };
    if(string_starts_with_char(string, 'a')) {
        static const String AFTERNOON_VALUE = string_literal("afternoon");
        if(string_equals(&AFTERNOON_VALUE, string)) {
            time.window = AFTERNOON;
        }
    } else if(string_starts_with_char(string, 'f')) {
        static const String FULL_DAY_VALUE = string_literal("fullday");
        if(string_equals(&FULL_DAY_VALUE, string)) {
            time.window = FULL_DAY;
        }
    } else if(string_starts_with_char(string, 'm')) {
        static const String MORNING_VALUE = string_literal("morning");
        if(string_equals(&MORNING_VALUE, string)) {
            time.window = MORNING;
        }
    } else {
        time.window = PUNCTUAL;
        Short hours;
        {
            const String substring = string_get_substring(string, 0u, 2u);
            hours = (Short) (string_to_number(&substring) % 24);
        }
        Short minutes;
        {
            const String substring = string_get_substring(string, 3u, 2u);
            minutes = (Short) (string_to_number(&substring) % 60);
        }
        time.seconds_in_day = (SecondsInDay) { hours*60u + minutes };
    }
    return time;
}

void time_to_string(const Time *time, TimeString *time_string)
{
    switch(time->window) {
        case MORNING: {
            *time_string = (TimeString) {
                .data="morning",
                .size=sizeof("morning")-1u
            };
        } break;
        case AFTERNOON: {
            *time_string = (TimeString) {
                .data="afternoon",
                .size=sizeof("afternoon")-1u
            };
        } break;
        case FULL_DAY: {
            *time_string = (TimeString) {
                .data="fullday",
                .size=sizeof("fullday")-1u
            };
        } break;
        case PUNCTUAL: {
            const Short seconds_in_day = (time->seconds_in_day).value;
            const Short hours = seconds_in_day / 60u;
            const Short minutes = seconds_in_day % 60u;
            TimeString result = {
                .data={0},
                .size=5u
            };
            string_of_number_trailing(hours, 2u, result.data);
            string_of_number_trailing(minutes, 2u, result.data+3);
            result.data[2] = ':';
            *time_string = result;
        } break;
    }
}
