#include "./route_calendar.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"
#include "../shared/string_equals.h"
#include "../shared/date_string.h"
#include "../shared/days_since_epoch.h"
#include "../shared/days_since_epoch_from_string.h"
#include "../shared/days_since_epoch_to_string.h"
#include "../shared/small_int_from_string.h"
#include "../dynamic/series.h"
#include "../dynamic/dataframe.h"
#include "../ioserver.h"

#include "../shared/unsafe/positive_int_to_unsigned_int.h"

#include "../template_engines/calendar_grid_template.h"


struct RouteQueryParameters
{
    unsigned int weeks_count;
    DaysFromEpoch focus_date;
    DaysFromEpoch today_date;
    int focus_flag;
    int today_flag;
};

static struct RouteQueryParameters route_qp;

static int rectify_route_query_parameters(void)
{
    if(route_qp.weeks_count < 1) {
        route_qp.weeks_count = 1;
    } else if(route_qp.weeks_count > 6) {
        route_qp.weeks_count = 6;
    }

    if(!route_qp.today_flag) {
        return 0;
    }

    if(!route_qp.focus_flag) {
        assert(route_qp.today_flag, "rectify_route_query_parameters route_calendar. today_flag not set");
        route_qp.focus_flag = route_qp.today_flag;
        route_qp.focus_date = route_qp.today_date;
    }

    return 1;
}


int route_calendar_guard(const char* url_segments)
{
    const char* cursor = url_segments;
    if(!string_equals(cursor, "calendar")) {
        return 0;
    } else {
        cursor += 1 + string_length(cursor);
        route_qp.weeks_count = 0;
        route_qp.focus_flag = 0;
        route_qp.today_flag = 0;
        return 1;
    }
}

int route_calendar_handle_query_parameter(const char* key, const char* value)
{
    if(string_equals(key, "focus_date")) {
        DateString date_string;
        date_string_initialize_from_buffer(&date_string, value);
        route_qp.focus_flag = 1;
        route_qp.focus_date = days_since_epoch_from_string(&date_string);
        return 1;
    } else if(string_equals(key, "today_date")) {
        DateString date_string;
        date_string_initialize_from_buffer(&date_string, value);
        route_qp.today_flag = 1;
        route_qp.today_date = days_since_epoch_from_string(&date_string);
        return 1;
    } else if(string_equals(key, "weeks_count")) {
        route_qp.weeks_count = small_int_from_string(value);
        return 1;
    }
    return 0;
}

void route_calendar_terminate(void)
{
    if(rectify_route_query_parameters()) {
        /**
         * We populate a dataframe based on what is stored in the store.
         * The dataframe we plan to create is specified as follows:
         *
         * Columns:
         * --------
         *  - strdate
         *      dates that must be displayed on the grid. they start on Monday,
         *      and there are weeks_count*7 many of them.
         *  - unread
         *      whether or not the date contains at least one unread appointment
         *  - isdayoff
         *      whether or not the date contains at least one appointment marked as day off
         */
        const unsigned int number_of_days_to_display = route_qp.weeks_count * 7;

        NumericSeries unreads;
        series_init(&unreads, number_of_days_to_display);

        NumericSeries isdayoffs;
        series_init(&isdayoffs, number_of_days_to_display);

        NumericSeries has_appointments;
        series_init(&has_appointments, number_of_days_to_display);

        StringSeries dates_to_display;
        series_create(&dates_to_display);
        
        {
            // Prepare date cursor to Monday
            DaysFromEpoch cursor_date = days_since_epoch_add_days(
                route_qp.focus_date,
                -((int) days_since_epoch_get_wday(route_qp.focus_date))
            );
            assert(days_since_epoch_get_wday(cursor_date) == 0, "grid_template grid_template_flush rectified day is not a Monday");

            // Fill the series to have number_of_weeks dates to print
            DateString date_string;
            for(unsigned int counter = number_of_days_to_display; counter--;) {
                days_since_epoch_to_string(cursor_date, &date_string);
                series_push(&dates_to_display, date_string_open_buffer(&date_string));
                cursor_date = days_since_epoch_add_days(cursor_date, 1);
            }
        }

        {
            Dataframe df;
            dataframe_select_isin(0, STRDATE_COLUMN_INDEX, &dates_to_display, &df);

            NumericSeries source_dates_indices;
            dataframe_get_column_at_index(&df, STRDATE_COLUMN_INDEX, &source_dates_indices);

            const unsigned int subset_size = series_size(&source_dates_indices);

            NumericSeries source_unread, source_isdayoff;
            dataframe_get_column_at_index(&df, UNREAD_COLUMN_INDEX, &source_unread);
            dataframe_get_column_at_index(&df, ISDAYOFF_COLUMN_INDEX, &source_isdayoff);
            
            for(unsigned int i = 0; i < subset_size; i++) {
                const unsigned int index = positive_int_to_unsigned_int(
                    series_get(&source_dates_indices, i)
                );
                series_set(&has_appointments, index, 1);
                if(series_get(&source_unread, i)) {
                    series_set(&unreads, index, 1);
                }
                if(series_get(&source_isdayoff, i)) {
                    series_set(&isdayoffs, index, 1);
                }
            }
        }

        unsigned int number_of_unreads;
        {
            NumericSeries series_of_true;
            series_create(&series_of_true);
            series_push(&series_of_true, 1);

            Dataframe df;
            dataframe_select_isin(0, 2 /* unread */, &series_of_true, &df);

            dataframe_get_column_at_index(&df, 2 /* unread */, &series_of_true);
            number_of_unreads = series_size(&series_of_true);
        }

        calendar_grid_template(
            route_qp.focus_date,
            route_qp.today_date,
            route_qp.weeks_count,
            &dates_to_display,
            &has_appointments,
            &unreads,
            &isdayoffs,
            number_of_unreads
        );
    }
}
