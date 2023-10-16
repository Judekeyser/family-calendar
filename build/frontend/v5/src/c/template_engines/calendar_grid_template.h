# ifndef APP_ROUTE_CALENDAR_GRID_TEMPLATE
# define APP_ROUTE_CALENDAR_GRID_TEMPLATE

# include "../shared/days_since_epoch.h"
# include "../dynamic/series.h"


int calendar_grid_template(
    DaysFromEpoch focus_date,
    DaysFromEpoch today_date,
    const unsigned int weeks_count,
    const DateStringSeries* days_to_display,
    const NumericSeries* has_appointments,
    const NumericSeries* unreads,
    const NumericSeries* isdayoffs
);

# endif 
