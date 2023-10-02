#include "./days_since_epoch_to_string.h"

#include "./assert.h"
#include "./days_since_epoch.h"
#include "./date_string.h"


void days_since_epoch_to_string(DaysFromEpoch date, char* strdate)
{
    const unsigned int numeric_year = days_since_epoch_get_year(date);
    const unsigned int numeric_month = days_since_epoch_get_month(date);
    const unsigned int numeric_day = days_since_epoch_get_mday(date);

    date_string_from_triple(
        numeric_year, numeric_month, numeric_day,
        strdate
    );
}
