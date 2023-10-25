#include "./french_format.h"
#include "./assert.h"

#include "./string_length.h"
#include "./string_copy.h"
#include "./small_int_on_one_digit.h"
#include "./small_int_on_two_digits.h"
#include "./days_since_epoch.h"

#include "./days_since_epoch.h"
#include "./time_slot_of_day.h"


static const char* const LUN = "Lundi";
static const char* const MAD = "Mardi";
static const char* const MER = "Mercredi";
static const char* const JEU = "Jeudi";
static const char* const VEN = "Vendredi";
static const char* const SAM = "Samedi";
static const char* const DIM = "Dimanche";

static const char* const WEEK_DAYS[] = {LUN,MAD,MER,JEU,VEN,SAM,DIM};

static const char* const JAN = "Janvier";
static const char* const FEB = "Février";
static const char* const MAR = "Mars";
static const char* const AVR = "Avril";
static const char* const MAI = "Mai";
static const char* const JUN = "Juin";
static const char* const JUL = "Juillet";
static const char* const AOT = "Août";
static const char* const SEP = "Septembre";
static const char* const OCT = "Octobre";
static const char* const NOV = "Novembre";
static const char* const DEC = "Décembre";

static const char* const MONTHS[] = {JAN,FEB,MAR,AVR,MAI,JUN,JUL,AOT,SEP,OCT,NOV,DEC};

static const char* const MORNING = "Au matin";
static const char* const AFTERNOON = "En après-midi";
static const char* const FULLDAY = "Toute la jounée";
static const char* const A_PREPOSITION = "A\xcc\x80 ";

static const char* const ERROR = "";


static const char* month_to_french(const unsigned int month) {
    if(month >= 1 && month <= 12) {
        return MONTHS[month - 1];
    } else {
        return ERROR;
    }
}


static const char* week_day_to_french(const unsigned int week_day) {
    if(week_day >= 0 && week_day <= 6) {
        return WEEK_DAYS[week_day];
    } else {
        return ERROR;
    }
}


static void days_from_epoch_to_french(DaysFromEpoch days_from_epoch, char* target) {
    const unsigned int day_of_month = days_since_epoch_get_mday(days_from_epoch);

    string_copy(target, week_day_to_french(days_since_epoch_get_wday(days_from_epoch)));
    target += string_length(target);
    *(target++) = ' ';

    if(day_of_month < 10) {
        small_int_on_one_digit(day_of_month, target);
        target += 1;
        if(day_of_month == 1) {
            string_copy(target, "er");
            target += 2;
        }
    } else {
        small_int_on_two_digits(day_of_month, target);
        target += 2;
    }
    *(target++) = ' ';

    string_copy(target, month_to_french(days_since_epoch_get_month(days_from_epoch)));
}


static void time_slot_to_french(TimeSlotOfDay time_slot, char* target) {
    if(time_slot_of_day_is_fullday(time_slot)) {
        string_copy(target, FULLDAY);
    } else if(time_slot_of_day_is_afternoon(time_slot)) {
        string_copy(target, AFTERNOON);
    } else if(time_slot_of_day_is_morning(time_slot)) {
        string_copy(target, MORNING);
    } else {
        string_copy(target, A_PREPOSITION);
        target += 4;
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
}


void french_format_use_pattern(FrenchFormat* format, const FrenchFormatTemplate template, const unsigned char capitalize) {
    format -> template = template;
    format -> capitalize = capitalize;
}

const char* french_format_set(FrenchFormat* format, const DaysFromEpoch* _days_from_epoch, const TimeSlotOfDay* _time_slot_of_day) {
    const DaysFromEpoch days_from_epoch = *_days_from_epoch;
    const TimeSlotOfDay time_slot_of_day = *_time_slot_of_day;
    char* buffer = format -> buffer;

    switch(format -> template) {
        case MONTH_ONLY_PATTERN:
            {
                const unsigned int month = days_since_epoch_get_month(days_from_epoch);
                string_copy(buffer, month_to_french(month));
            }
            break;
        case LONG_DATE_TIME_IDENTIFIER:
            {
                days_from_epoch_to_french(days_from_epoch, buffer);
                buffer += string_length(buffer);
                string_copy(buffer, ", ");
                buffer += 2;
                time_slot_to_french(time_slot_of_day, buffer);
                *buffer += 'a' - 'A';
            }
            break;
        case LONG_DATE:
            {
                days_from_epoch_to_french(days_from_epoch, buffer);
            }
            break;
        case LONG_TIME_IDENTIFIER:
            {
                time_slot_to_french(time_slot_of_day, buffer);
            }
            break;
    }
    if(!format->capitalize) {
        *(format -> buffer) += 'a' - 'A';
    }
    return format -> buffer;
}

const char* french_format_get(const FrenchFormat* french_format) {
    return french_format -> buffer;
}
