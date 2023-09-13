#include "./time_strdate_to_tm.h"

#include <time.h>
#include <assert.h>
#include <string.h>
#include <stdlib.h>

time_t time_strdate_to_tm(const char* str_date, struct tm* datetime)
{
    static char str_date_split[10];
    assert(strlen(str_date) == 10);
    strcpy(str_date_split, str_date);
    str_date_split[4] = '\0';
    str_date_split[7] = '\0';

    const int numeric_year = atoi(str_date_split);
    const int numeric_month = atoi(str_date_split + 5);
    const int numeric_day = atoi(str_date_split + 8);

    datetime -> tm_isdst = 0;
    datetime -> tm_hour = 0;
    datetime -> tm_min = 0;
    datetime -> tm_sec = 0;

    datetime -> tm_year = numeric_year - 1900;
    datetime -> tm_mon = numeric_month - 1;
    datetime -> tm_mday = numeric_day;

    return mktime(datetime);
}
