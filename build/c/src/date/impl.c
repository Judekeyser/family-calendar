#include "./api.h"


static const Tiny DAY_MAX_TABLE_NONLEAP[] = { 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
static const Tiny DAY_MAX_TABLE_LEAP[] = { 0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
static const Small CYCLE_SIZE = 365*4+1;


DaysFromEpoch date_unexplain(const Date *explained)
{
    const Small unsafe_year = explained->year;
    const Small unsafe_month = explained->month;
    const Small unsafe_day = explained->day;

    const Small safe_year = unsafe_year < 2099u ? (
        unsafe_year > 2001u ? unsafe_year : 2001u
    ) : 2099u;
    const Tiny *table = safe_year % 4 ? DAY_MAX_TABLE_NONLEAP : DAY_MAX_TABLE_LEAP;

    const Small year = safe_year - 2001u;
    const Small month = unsafe_month > 1u ? (
        unsafe_month < 12u ? unsafe_month : 12u
    ) : 1u;
    const Small day = unsafe_day > 1u ? (
        unsafe_day < table[month] ? unsafe_day : table[month]
    ) : 1u;

    Small cumulMonthDays = 0u;
    for(Size i = month; i--;) {
        cumulMonthDays += table[i];
    }

    Small value = day + cumulMonthDays + (year/4u)*CYCLE_SIZE + (year%4u)*365u - 1u;
    // The value should be maximum 999*366, which is lower than 2**16
    return (DaysFromEpoch) {
        .value = (Short) value
    };
}

DaysFromEpoch date_from_string(const String *string)
{
    Date explained;
    // Casts below are safe, because we only fetch max 4 digits

    {
        const String substring = string_get_substring(string, 0u, 4u);
        explained.year = (Short) string_to_number(&substring);
    }
    {
        const String substring = string_get_substring(string, 5u, 2u);
        explained.month = (Short) string_to_number(&substring);
    }
    {
        const String substring = string_get_substring(string, 8u, 2u);
        explained.day = (Short) string_to_number(&substring);
    }

    return date_unexplain(&explained);
}

Date date_explain(const DaysFromEpoch *date)
{
    Small days_left = date->value;
    const Small cycles_before = days_left / CYCLE_SIZE;
    const Small years_out_cycle = days_left % CYCLE_SIZE;

    const Small years_before = MIN(years_out_cycle / 365u, 3u);
    const Small year = cycles_before * 4u + years_before + 2001u;

    days_left = years_out_cycle - 365u * years_before; // Reduce the days to the numbers of days from inside the year
    const Tiny *table = years_before == 3u ? DAY_MAX_TABLE_LEAP : DAY_MAX_TABLE_NONLEAP;

    days_left += 1u;
    Size month;
    for(month = 1u; table[month] < days_left; month++) {
        days_left -= table[month];
    }

    return (Date) {
        .year = (Short) year,
        .month = (Short) month,
        .day = (Short) days_left
    };
}

void date_explained_to_string(const Date *date, DateString *date_string)
{
    char *data = date_string->data;

    (void) string_of_number_trailing(date->year, 4u, data);
    (void) string_of_number_trailing(date->month, 2u, data+5);
    (void) string_of_number_trailing(date->day, 2u, data+8);
    data[4] = '-';
    data[7] = '-';
}

void date_explained_increment(Date *date)
{
    const Small threshold = date->month == 2u ? 28u : 30u;
    if(date->day < threshold) {
        date->day += 1u;
    } else {
        DaysFromEpoch days_from_epoch = date_unexplain(date);
        days_from_epoch.value += 1u;
        *date = date_explain(&days_from_epoch);
        *date = date_explain(&days_from_epoch);
    }
}
