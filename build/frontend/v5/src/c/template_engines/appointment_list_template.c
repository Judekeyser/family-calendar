#include "./appointment_list_template.h"

#include "../shared/assert.h"
#include "../dynamic/series.h"
#include "../shared/date_string.h"
#include "../shared/time_slot_string.h"
#include "../shared/time_slot_to_french.h"
#include "../shared/b64_encode_string_to_string.h"

#include "../shared/unsafe/positive_int_to_unsigned_int.h"


struct Appointment {
    const StringSeries* appointment_times;
    const StringSeries* descriptions;
    const StringSeries* details;

    unsigned int _is_day_off;
    unsigned int _unread;

    char buffer[1];
    DateString __date_string;
    char __buffer_french_temporal_marker[TIME_SLOT_TO_FRENCH_TARGET_BUFFER_UPPER_BOUND];
    char __buffer_b64_description[512];

    const char*(*strdate)(struct Appointment* self);
    const char*(*french_temporal_marker)(struct Appointment* self);
    const char*(*b64_strdescription)(struct Appointment* self);
    const char*(*b64_strdetails)(struct Appointment* self);
    unsigned int (*is_day_off)(struct Appointment* self);
    unsigned int (*unread)(struct Appointment* self);
};

static const char* strdate(struct Appointment* self) {
    return date_string_open_buffer(&(self -> __date_string));
}

static const char* french_temporal_marker(struct Appointment* self) {
    return self -> __buffer_french_temporal_marker;
}

static const char* b64_strdescription(struct Appointment* self) {
    return self -> __buffer_b64_description;
}

static const char* b64_strdetails(struct Appointment* self) {
    return self -> buffer;
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

    const StringSeries* appointment_times;
    const NumericSeries* isdayoffs;
    const NumericSeries* unreads;
    const StringSeries* descriptions;

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
            series_get(self -> appointment_times, index,
                    (self -> _appointment).__buffer_french_temporal_marker, 10
            );
            TimeSlotString time_string;
            time_slot_string_initialize_from_buffer((self -> _appointment).__buffer_french_temporal_marker, &time_string);
            TimeSlotOfDay time_slot = time_slot_string_to_time_slot_of_day(&time_string);
            time_slot_to_french(time_slot, 1, (self -> _appointment).__buffer_french_temporal_marker);
        }
        {
            char buffer[360];
            series_get(self -> descriptions, index, buffer, 360);
            b64_encode_string_to_string(buffer, (self -> _appointment).__buffer_b64_description);
        }
        
        self -> current_index  += 1;
        return &(self -> _appointment);
    }
}


#define TMPL_T_ROOT struct Root*
#define TMPL_T_APPOINTMENTS struct Appointment*

#include "../templates/appointment_list.template.h"


int appointment_list_template(
    DaysFromEpoch _focus_date,
    const StringSeries* _appointment_times,
    const NumericSeries* _unreads,
    const NumericSeries* _isdayoffs,
    const StringSeries* _descriptions,
    const StringSeries* _details
) {
    const unsigned int element_count = series_size(_appointment_times);
    assert(series_size(_appointment_times) == series_size(_unreads),
        "`appointment_list_template` _unreads series does not have same length than _appointment_times");
    assert(series_size(_appointment_times) == series_size(_isdayoffs),
        "`appointment_list_template` _isdayoffs series does not have same length than _appointment_times");
    assert(series_size(_appointment_times) == series_size(_descriptions),
        "`appointment_list_template` _descriptions series does not have same length than _appointment_times");
    assert(series_size(_appointment_times) == series_size(_details),
        "`appointment_list_template` _details series does not have same length than appointment_times");

    struct Root root = {
        .element_count = element_count,
        .current_index = 0,

        .isdayoffs = _isdayoffs,
        .unreads = _unreads,
        .appointment_times = _appointment_times,
        .descriptions = _descriptions,

        .appointments = appointments
    };

    root._appointment.appointment_times = _appointment_times;
    root._appointment.details = _details;

    root._appointment.strdate = strdate;
    root._appointment.french_temporal_marker = french_temporal_marker;
    root._appointment.unread = unread;
    root._appointment.is_day_off = is_day_off;
    root._appointment.b64_strdescription = b64_strdescription;
    root._appointment.b64_strdetails = b64_strdetails;

    date_string_from_days_from_epoch(_focus_date, &root._appointment.__date_string);

    run(&root);

    return 0;
}
