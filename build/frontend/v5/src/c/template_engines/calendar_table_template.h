# ifndef APP_ROUTE_CALENDAR_TABLE_TEMPLATE
# define APP_ROUTE_CALENDAR_TABLE_TEMPLATE

# include "../shared/days_since_epoch.h"
# include "../dynamic/series.h"


int calendar_table_template(
    DaysFromEpoch focus_date,
    DaysFromEpoch today_date,
    const StringSeries* days_to_display,
    const NumericSeries* has_appointments,
    const NumericSeries* unreads,
    const NumericSeries* isdayoffs
);

# endif 
