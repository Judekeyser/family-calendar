# ifndef APP_ROUTE_APPOINTMENT_LIST_TEMPLATE
# define APP_ROUTE_APPOINTMENT_LIST_TEMPLATE

# include "../shared/days_since_epoch.h"
# include "../dynamic/series.h"


int appointment_list_template(
    DaysFromEpoch focus_date,
    const StringSeries* appointment_times,
    const NumericSeries* unreads,
    const NumericSeries* isdayoffs,
    const StringSeries* descriptions,
    const StringSeries* details
);

# endif 
