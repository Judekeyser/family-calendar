# ifndef __APP_ROUTE_CALENDAR_GRID_TEMPLATE__
# define __APP_ROUTE_CALENDAR_GRID_TEMPLATE__

# include "../shared/days_since_epoch.h"


int grid_template_flush(
    const int weeks_count,
    const struct DaysSinceEpoch* focus_date,
    const struct DaysSinceEpoch* today_date
);

# endif 