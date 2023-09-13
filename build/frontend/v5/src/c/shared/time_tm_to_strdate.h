#ifndef __APP_SHARED_TIME_TM_TO_STRDATE__
#define __APP_SHARED_TIME_TM_TO_STRDATE__

#include <time.h>

void time_tm_to_strdate(const struct tm* datetime, char* str_date);

#endif