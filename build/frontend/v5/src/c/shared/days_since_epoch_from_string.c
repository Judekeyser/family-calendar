#include "./days_since_epoch_from_string.h"

#include "./assert.h"
#ifndef NDEBUG
#include "./string_length.h"
#endif

#include "./date_string.h"


DaysFromEpoch days_since_epoch_from_string(DateString* date_string) {
    assert(
        string_length(date_string_open_buffer(date_string)) == 10,
        "`days_since_epoch_from_string` Provided string length does not equal 10"
    );
    const unsigned int numeric_year = date_string_get_year(date_string);
    const unsigned int numeric_month = date_string_get_month(date_string);
    const unsigned int numeric_day = date_string_get_mday(date_string);
    return days_since_epoch_from_triple(numeric_year, numeric_month, numeric_day);
}
