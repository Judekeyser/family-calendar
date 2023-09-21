#ifndef __APP_SHARED_DATE_FROM_STRING__
#define __APP_SHARED_DATE_FROM_STRING__

#include "./days_since_epoch.h"

void date_from_string(const char* str_date, struct DaysSinceEpoch* datetime);

#endif