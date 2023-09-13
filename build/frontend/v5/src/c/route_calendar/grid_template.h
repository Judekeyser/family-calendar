# ifndef __APP_ROUTE_CALENDAR_GRID_TEMPLATE__
# define __APP_ROUTE_CALENDAR_GRID_TEMPLATE__

#include <time.h>

int grid_template_flush(
    const int weeks_count,
    const struct tm* focus_tm,
    const struct tm* today_tm
);

# endif 