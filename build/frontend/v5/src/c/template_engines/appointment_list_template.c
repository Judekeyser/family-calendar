#include "./appointment_list_template.h"

#include "../shared/assert.h"
#include "../dynamic/series.h"
#include "../shared/string_length.h"
#include "../shared/string_copy.h"
#include "../shared/date_string.h"
#include "../shared/time_slot_string.h"
#include "../shared/french_format.h"
#include "../shared/b64_encode_string_to_string.h"

#include "../shared/unsafe/positive_int_to_unsigned_int.h"


struct Appointment {
    unsigned int _is_day_off;
    unsigned int _unread;

    FrenchFormat french_format;
    char __buffer_b64_description[512];
    char __buffer_b64_details[512];

    const char*(*french_datetime)(struct Appointment* self);
    const char*(*b64_strdescription)(struct Appointment* self);
    const char*(*b64_strdetails)(struct Appointment* self);
    unsigned int (*is_day_off)(struct Appointment* self);
    unsigned int (*unread)(struct Appointment* self);
};

static const char* french_datetime(struct Appointment* self) {
    return french_format_get(&(self -> french_format));
}

static const char* b64_strdescription(struct Appointment* self) {
    return self -> __buffer_b64_description;
}

static const char* b64_strdetails(struct Appointment* self) {
    return self -> __buffer_b64_details;
}

static unsigned int is_day_off(struct Appointment* self) {
    return self -> _is_day_off;
}

static unsigned int unread(struct Appointment* self) {
    return self -> _unread;
}


struct Root {
    unsigned int current_index;
    const unsigned int element_count;
    struct Appointment _appointment;

    const StringSeries* appointment_dates;
    const StringSeries* appointment_times;
    const NumericSeries* isdayoffs;
    const NumericSeries* unreads;
    const StringSeries* descriptions;
    const StringSeries* details;

    struct Appointment*(*appointments)(struct Root* self);
};

static struct Appointment* appointments(struct Root* self) {
    if(self -> current_index >= self -> element_count) {
        return 0;
    } else {
        const unsigned int index = self -> current_index;
        // fetch data
        (self -> _appointment)._is_day_off = positive_int_to_unsigned_int(
            series_get(self -> isdayoffs, index)
        );
        (self -> _appointment)._unread = positive_int_to_unsigned_int(
            series_get(self -> unreads, index)
        );
        {
            TimeSlotOfDay time_slot;
            DaysFromEpoch days_from_epoch;
            DaysFromEpoch* flagged_days_from_epoch;
            if(self -> appointment_dates) {
                DateString date_string;
                series_get(self -> appointment_dates, index, DATE_STRING_SPREAD(date_string));
                days_from_epoch = date_string_to_days_from_epoch(&date_string);
                flagged_days_from_epoch = &days_from_epoch;
            } else {
                flagged_days_from_epoch = 0;
            }

            {
                TimeSlotString time_slot_string;
                series_get(self -> appointment_times, index, TIME_SLOT_STRING_SPREAD(time_slot_string));
                time_slot = time_slot_string_to_time_slot_of_day(&time_slot_string);
            }

            french_format_set(&(self -> _appointment).french_format, flagged_days_from_epoch, &time_slot);
        }
        {
            char buffer[360];
            series_get(self -> descriptions, index, buffer, 360);
            b64_encode_string_to_string(buffer, (self -> _appointment).__buffer_b64_description);
        }
        {
            char buffer[360];
            series_get(self -> details, index, buffer, 360);
            b64_encode_string_to_string(buffer, (self -> _appointment).__buffer_b64_details);
        }
        
        self -> current_index  += 1;
        return &(self -> _appointment);
    }
}


#define TMPL_T_ROOT struct Root*
#define TMPL_T_APPOINTMENTS struct Appointment*

#include "../templates/appointment_list.template.h"


int appointment_list_template(
    const StringSeries* _nullable_appointment_dates,
    const StringSeries* _appointment_times,
    const NumericSeries* _unreads,
    const NumericSeries* _isdayoffs,
    const StringSeries* _descriptions,
    const StringSeries* _details
) {
    const unsigned int element_count = series_size(_appointment_times);

    struct Root root = {
        .element_count = element_count,
        .current_index = 0,

        ._appointment = {
            .french_datetime = french_datetime,
            .unread = unread,
            .is_day_off = is_day_off,
            .b64_strdescription = b64_strdescription,
            .b64_strdetails = b64_strdetails
        },

        .isdayoffs = _isdayoffs,
        .unreads = _unreads,
        .appointment_dates = _nullable_appointment_dates,
        .appointment_times = _appointment_times,
        .descriptions = _descriptions,
        .details = _details,

        .appointments = appointments
    };

    french_format_use_pattern(
        &root._appointment.french_format,
        _nullable_appointment_dates ? LONG_DATE_TIME_IDENTIFIER : LONG_TIME_IDENTIFIER,
        1
    );

    run(&root);

    return 0;
}
