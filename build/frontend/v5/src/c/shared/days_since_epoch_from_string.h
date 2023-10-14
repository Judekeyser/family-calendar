/**
 * Header file `days_since_epoch_from_string.h`
 * --------------------------------------------
 *
 * The aime of this header is to provide an interface to interpret a string
 * that is supposed to represent a date, formatted as
 *      YYYY-MM-DD
 * The result is assumed to be a valid `DaysFromEpoch`.
 */

#ifndef APP_SHARED_DATE_FROM_STRING
#define APP_SHARED_DATE_FROM_STRING

#include "./days_since_epoch.h"
#include "./date_string.h"


DaysFromEpoch days_since_epoch_from_string(DateString* str_date);

#endif
