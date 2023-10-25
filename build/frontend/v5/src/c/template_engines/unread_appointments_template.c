#include "./unread_appointments_template.h"

#include "../shared/prototypes.h"
#include "../shared/assert.h"
#include "../shared/date_string.h"
#include "../shared/time_slot_string.h"
#include "../shared/string_copy.h"
#include "../shared/string_length.h"
#include "../dynamic/series.h"
#include "../dynamic/dataframe.h"

#include "./menu_template.h"
#include "./appointment_list_template.h"


struct Root {
    NumericSeries _unreads;
    NumericSeries _isdayoffs;
    StringSeries _appointment_dates;
    StringSeries _appointment_times;
    StringSeries _descriptions;
    StringSeries _details;

    unsigned char(*any_appointment)(struct Root* root);
    void(*menu)(struct Root* root);
    void(*appointment_list)(struct Root* root);
};

static unsigned char any_appointment(struct Root* self) {
    return series_size(&(self -> _appointment_times)) ? 1 : 0;
}

static void menu(struct Root* self) {
    UNUSED(self);
    menu_template(
        MENU_TEMPLATE_HYPERLINK__ALTER_CALENDAR | MENU_TEMPLATE_HYPERLINK__BACK_TO_GRID
    );
}

static void appointment_list(struct Root* self) {
    appointment_list_template(
        &(self -> _appointment_dates),
        &(self -> _appointment_times),
        &(self -> _unreads),
        &(self -> _isdayoffs),
        &(self -> _descriptions),
        &(self -> _details)
    );
}

#define TMPL_T_ROOT struct Root*
#include "../templates/appointments_of_day.template.h"


int unread_appointments_template(void) {
    Dataframe df;
    {
        {
            series_create_empty(NumericSeries, boolean_true_series, 0);
            series_push(&boolean_true_series, 1);
            assert(series_size(&boolean_true_series) == 1, "Inserting series of one element but size does not match");
            dataframe_select_isin(0, UNREAD_COLUMN_INDEX, &boolean_true_series, &df);
        }

        {
            series_create_from_dataframe_column(StringSeries, dates_series, &df, STRDATE_COLUMN_INDEX);
            series_create_from_dataframe_column(StringSeries, times_series, &df, STRTIME_COLUMN_INDEX);

            const unsigned int series_size = series_size(&dates_series);
            assert(series_size(&times_series) == series_size(&dates_series), "Series of dates and times should have same size");

            DateStringSeries date_string_series;
            date_string_series_create(&date_string_series);

            TimeSlotStringSeries time_slot_string_series;
            time_slot_string_series_create(&time_slot_string_series);

            for(unsigned int i = 0; i < series_size; i++) {
                TimeSlotString time_slot_string;
                {
                    DateString date_string;
                    series_get(&dates_series, i, DATE_STRING_SPREAD(date_string));
                    DaysFromEpoch days_from_epoch = date_string_to_days_from_epoch(&date_string);
                    date_string_from_days_from_epoch(days_from_epoch, &date_string);
                    series_push(&date_string_series, &date_string);
                }
                {
                    series_get(&times_series, i, TIME_SLOT_STRING_SPREAD(time_slot_string));
                    TimeSlotOfDay time_slot_of_day = time_slot_string_to_time_slot_of_day(&time_slot_string);
                    if(time_slot_of_day_is_fullday(time_slot_of_day)) {
                        time_slot_string_initialize_from_buffer("", &time_slot_string);
                    } else if(time_slot_of_day_is_morning(time_slot_of_day)) {
                        time_slot_string_initialize_from_buffer("00:", &time_slot_string);
                    } else if(time_slot_of_day_is_afternoon(time_slot_of_day)) {
                        time_slot_string_initialize_from_buffer("12:", &time_slot_string);
                    } else {
                        time_slot_string_from_time_slot_of_day(time_slot_of_day, &time_slot_string);
                    }
                    series_push(&time_slot_string_series, &time_slot_string);
                }
            }

            const unsigned int new_time_index = dataframe_append_column(&df, "__sortable_time__", &time_slot_string_series);
            const unsigned int new_date_index = dataframe_append_column(&df, "__sortable_date__", &date_string_series);
            dataframe_reindex(&df, new_time_index, &df);
            dataframe_reindex(&df, new_date_index, &df);
        }
    }
    
    series_create_from_dataframe_column(NumericSeries, unreads, &df, UNREAD_COLUMN_INDEX);
    series_create_from_dataframe_column(NumericSeries, isdayoffs, &df, ISDAYOFF_COLUMN_INDEX);
    series_create_from_dataframe_column(StringSeries, appointment_dates, &df, STRDATE_COLUMN_INDEX);
    series_create_from_dataframe_column(StringSeries, appointment_times, &df, STRTIME_COLUMN_INDEX);
    series_create_from_dataframe_column(StringSeries, descriptions, &df, DESCRIPTION_COLUMN_INDEX);
    series_create_from_dataframe_column(StringSeries, details, &df, DETAIL_COLUMN_INDEX);

    struct Root root = {
        ._unreads = unreads,
        ._isdayoffs = isdayoffs,
        ._appointment_dates = appointment_dates,
        ._appointment_times = appointment_times,
        ._descriptions = descriptions,
        ._details = details,

        .any_appointment = any_appointment,

        .menu = menu,
        .appointment_list = appointment_list
    };

    run(&root);
    return 1;
}

#undef TMPL_T_ROOT
