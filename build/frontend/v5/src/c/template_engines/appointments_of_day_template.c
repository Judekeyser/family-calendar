#include "./appointments_of_day_template.h"

#include "../shared/assert.h"
#include "../shared/date_string.h"
#include "../shared/time_slot_of_day_from_string.h"
#include "../shared/time_slot_of_day_to_string.h"
#include "../shared/string_copy.h"
#include "../dynamic/series.h"
#include "../dynamic/dataframe.h"

#include "./menu_template.h"
#include "./appointment_list_template.h"


struct Root {
    DaysFromEpoch _focus_date;
    NumericSeries _unreads;
    NumericSeries _isdayoffs;
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
        MENU_TEMPLATE_HYPERLINK__CREATE_APPOINTMENT | MENU_TEMPLATE_HYPERLINK__BACK_TO_GRID
    );
}

static void appointment_list(struct Root* self) {
    appointment_list_template(
        self -> _focus_date,
        &(self -> _appointment_times),
        &(self -> _unreads),
        &(self -> _isdayoffs),
        &(self -> _descriptions),
        &(self -> _details)
    );
}

#define TMPL_T_ROOT struct Root*
#include "../templates/appointments_of_day.template.h"


int appointments_of_day_template(DaysFromEpoch focus_date) {
    Dataframe df;
    {
        {
            DateString date_string;
            date_string_from_days_from_epoch(focus_date, &date_string);
            StringSeries date_to_display; // Series of 1 date to display
            series_create(&date_to_display);
            series_push(&date_to_display, date_string_open_buffer(&date_string));
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

    struct Root root = {
        ._focus_date = focus_date,
        ._unreads = unreads,
        ._isdayoffs = isdayoffs,
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
