#ifndef __APP_SHARED_TIME_STRDATE_TO_TM__
#define __APP_SHARED_TIME_STRDATE_TO_TM__

#include <time.h>

time_t time_strdate_to_tm(const char* str_date, struct tm* datetime);

#endif