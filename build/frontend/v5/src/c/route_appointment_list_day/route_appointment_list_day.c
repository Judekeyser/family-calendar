#include "./route_appointment_list_day.h"

#include "../shared/assert.h"
#include "../shared/days_since_epoch_from_string.h"
#include "../shared/time_slot_of_day_from_string.h"
#include "../shared/time_slot_of_day_to_string.h"
#include "../shared/days_since_epoch_to_string.h"
#include "../shared/string_equals.h"
#include "../shared/string_length.h"
#include "../shared/string_copy.h"
#include "../dynamic/series.h"
#include "../dynamic/dataframe.h"

#include "../template_engines/appointment_list_template.h"


struct RouteQueryParameters
{
    DaysFromEpoch focus_date;
    unsigned int focus_flag;
};

static struct RouteQueryParameters route_qp;


int route_appointment_list_day_guard(const char* url_segments)
{
    if(string_equals(url_segments, "appointments")) {
        url_segments += 1 + string_length(url_segments);
        if(string_equals(url_segments, "day")) {
            url_segments += 1 + string_length(url_segments);
            route_qp.focus_flag = 0;
            return 1;
        }
    }
    return 0;
}

int route_appointment_list_day_handle_query_parameter(const char* key, const char* value)
{
    if(string_equals(key, "focus_date")) {
        route_qp.focus_flag = 1;
        route_qp.focus_date = days_since_epoch_from_string(value);
        return 1;
    }
    return 0;
}

#include "../template.h"
void route_appointment_list_day_terminate(void)
{
    if(route_qp.focus_flag) {
        Dataframe df;
        {
            {
                char strdate[11];
                StringSeries date_to_display; // Series of 1 date to display
                series_create(&date_to_display);
                days_since_epoch_to_string(route_qp.focus_date, strdate);
                series_push(&date_to_display, strdate);
                assert(series_size(&date_to_display) == 1, "Inserting series of one element but size does not match");
                dataframe_select_isin(0, STRDATE_COLUMN_INDEX, &date_to_display, &df);
            }
            {
                StringSeries sortable_times;
                StringSeries initial_times;
                series_create(&sortable_times);
                dataframe_get_column_at_index(&df, STRTIME_COLUMN_INDEX, &initial_times);

                const unsigned int series_size = series_size(&initial_times);
                for(unsigned int i = 0; i < series_size; i++) {
                    char time_buffer[11];
                    series_get(&initial_times, i, time_buffer, 11);

                    TimeSlotOfDay time_slot = time_slot_of_day_from_string(time_buffer);
                    if(time_slot_of_day_is_afternoon(time_slot)) {
                        string_copy(time_buffer, "12:");
                    } else if (time_slot_of_day_is_morning(time_slot)) {
                        string_copy(time_buffer, "00:");
                    } else if (time_slot_of_day_is_fullday(time_slot)) {
                        string_copy(time_buffer, "");
                    } else {
                        time_slot_of_day_to_string(time_slot, time_buffer);
                    }

                    series_push(&sortable_times, time_buffer);
                }

                const unsigned int new_index = dataframe_append_string_column(&df, "__sortable_time__", &sortable_times);
                dataframe_reindex(&df, new_index, &df);
            }
        }

        NumericSeries unreads, isdayoffs;
        StringSeries appointment_times, descriptions, details;

        dataframe_get_column_at_index(&df, UNREAD_COLUMN_INDEX, &unreads);
        dataframe_get_column_at_index(&df, ISDAYOFF_COLUMN_INDEX, &isdayoffs);
        dataframe_get_column_at_index(&df, STRTIME_COLUMN_INDEX, &appointment_times);
        dataframe_get_column_at_index(&df, DESCRIPTION_COLUMN_INDEX, &descriptions);
        dataframe_get_column_at_index(&df, DETAIL_COLUMN_INDEX, &details);

        appointment_list_template(
            route_qp.focus_date,
            &appointment_times,
            &unreads,
            &isdayoffs,
            &descriptions,
            &details
        );
    }
}
