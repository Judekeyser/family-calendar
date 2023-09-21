#ifndef __APP_SHARED_DATE_TO_STRING__
#define __APP_SHARED_DATE_TO_STRING__

#include "./days_since_epoch.h"

void date_to_string(const struct DaysSinceEpoch* datetime, char* str_date);

#endif