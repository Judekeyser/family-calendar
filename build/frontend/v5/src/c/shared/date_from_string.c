#include "./date_from_string.h"

#include "./assert.h"
#include "./string_length.h"
#include "./string_copy.h"
#include "./days_since_epoch.h"
#include "./small_int_from_string.h"


void date_from_string(const char* str_date, struct DaysSinceEpoch* date)
{
    static char str_date_split[10];
    assert(string_length(str_date) == 10, "date_from_string Provided string length does not equal 10");
    string_copy(str_date_split, str_date);
    str_date_split[4] = '\0';
    str_date_split[7] = '\0';

    const int numeric_year = small_int_from_string(str_date_split);
    const int numeric_month = small_int_from_string(str_date_split + 5);
    const int numeric_day = small_int_from_string(str_date_split + 8);

    dse_set_date(numeric_year, numeric_month, numeric_day, date);
}
