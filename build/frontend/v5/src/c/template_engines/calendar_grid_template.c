#include "./calendar_grid_template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"
#include "../shared/string_copy.h"
#include "../shared/days_since_epoch.h"
#include "../shared/days_since_epoch_to_string.h"
#include "../shared/small_int_on_two_digits.h"
#include "../shared/small_int_on_one_digit.h"
#include "../dynamic/series.h"

#include "./calendar_table_template.h"


// Views structure
struct Root;

static const unsigned int UNREAD_SLICE_START = 0;                   // L = 3 + 1
static const unsigned int FOCUS_DATE_SLICE_START = 4;               // L = 10 + 1
static const unsigned int NEXT_FOCUS_DATE_SLICE_START = 15;         // L = 10 + 1
static const unsigned int PREVIOUS_FOCUS_DATE_SLICE_START = 26;     // L = 10 + 1
static const unsigned int TODAY_DATE_SLICE_START = 37;              // L = 10 + 1
static const unsigned int WEEKS_COUNT_SLICE_START = 48;             // L = 2 + 1

#define BUFFER_TOTAL_LENGTH 51 // Index of last 0 is good

struct UnreadNavigation {
    const char*(*size)(const struct UnreadNavigation* self);
};

struct Root {
    const DaysFromEpoch _focus_date;
    const DaysFromEpoch _today_date;

    const StringSeries* days_to_display;
    const NumericSeries* has_appointments;
    const NumericSeries* unreads;
    const NumericSeries* isdayoffs;

    char _buffer[BUFFER_TOTAL_LENGTH];

    void(*calendar_table)(const struct Root* self);
    const char*(*unread_size)(const struct Root* self);
    const char*(*today_strdate)(const struct Root* self);
    const char*(*focus_strdate)(const struct Root* self);
    const char*(*next_focus_strdate)(const struct Root* self);
    const char*(*previous_focus_strdate)(const struct Root* self);
    const char*(*str_weeks_count)(const struct Root* self);
};

static void calendar_table(const struct Root* self) {
    calendar_table_template(
        self -> _focus_date,
        self -> _today_date,
        self -> days_to_display,
        self -> has_appointments,
        self -> unreads,
        self -> isdayoffs
    );
}

static const char* unread_size(const struct Root* self) {
    return (self -> _buffer) + UNREAD_SLICE_START;
}

static const char* today_strdate(const struct Root* self) {
    return (self -> _buffer) + TODAY_DATE_SLICE_START;
}

static const char* next_focus_strdate(const struct Root* self) {
    return (self -> _buffer) + NEXT_FOCUS_DATE_SLICE_START;
}

static const char* focus_strdate(const struct Root* self) {
    return (self -> _buffer) + FOCUS_DATE_SLICE_START;
}

static const char* previous_focus_strdate(const struct Root* self) {
    return (self -> _buffer) + PREVIOUS_FOCUS_DATE_SLICE_START;
}

static const char* str_weeks_count(const struct Root* self) {
    return (self -> _buffer) + WEEKS_COUNT_SLICE_START;
}

# ifdef TMPL_T_ROOT
#   error Symbol `TMPL_T_ROOT` already defined
# endif
# define TMPL_T_ROOT struct Root*

# ifdef TMPL_T_UNREAD_NAVIGATION
#  error Symbol `TMPL_T_UNREAD_NAVIGATION` already defined
# endif
# define TMPL_T_UNREAD_NAVIGATION struct UnreadNavigation*

# include "../templates/calendar_grid.template.h"

# undef TMPL_T_SEARCHNAVIGATION
# undef TMPL_T_UNREAD_NAVIGATION
# undef TMPL_T_ROOT

int calendar_grid_template(
    DaysFromEpoch focus_date,
    DaysFromEpoch today_date,
    const unsigned int weeks_count,
    const StringSeries* days_to_display,
    const NumericSeries* has_appointments_series,
    const NumericSeries* unreads,
    const NumericSeries* isdayoffs,
    const unsigned int number_of_unreads
)
{
    assert(days_to_display, "table_template `days_to_display` series undefined");
    assert(has_appointments_series, "table_template `has_appointments_series` series undefined");
    assert(unreads, "table_template `unreads` series undefined");
    assert(isdayoffs, "table_template `isdayoffs` series undefined");

    struct Root root = {
        ._focus_date = focus_date,
        ._today_date = today_date,

        .days_to_display = days_to_display,
        .has_appointments = has_appointments_series,
        .unreads = unreads,
        .isdayoffs = isdayoffs,

        .calendar_table = calendar_table,
        .unread_size = unread_size,
        .today_strdate = today_strdate,
        .focus_strdate = focus_strdate,
        .next_focus_strdate = next_focus_strdate,
        .previous_focus_strdate = previous_focus_strdate,
        .str_weeks_count = str_weeks_count
    };

    { // Initializes buffer for unreads count
        char* const unreads_buffer = root._buffer + UNREAD_SLICE_START;
        if(number_of_unreads >= 100) {
            string_copy(unreads_buffer, "99+"); 
        } else if(number_of_unreads >= 10) {
            small_int_on_two_digits(number_of_unreads, unreads_buffer);
            unreads_buffer[2] = '\0';
        } else {
            small_int_on_one_digit(number_of_unreads, unreads_buffer);
            unreads_buffer[1] = '\0';
        }
        unreads_buffer[3] = '\0';
    }
    { // Initializes buffer for focus date
        char* const focus_date_buffer = root._buffer + FOCUS_DATE_SLICE_START;
        days_since_epoch_to_string(root._focus_date, focus_date_buffer);
        focus_date_buffer[11] = '\0';
    }
    { // Initializes buffer for next focus date
        char* const next_focus_date_buffer = root._buffer + NEXT_FOCUS_DATE_SLICE_START;
        DaysFromEpoch next_date = days_since_epoch_add_days(root._focus_date, 7);
        days_since_epoch_to_string(next_date, next_focus_date_buffer);
        next_focus_date_buffer[11] = '\0';
    }
    { // Initializes buffer for previous focus date
        char* const previous_focus_date_buffer = root._buffer + PREVIOUS_FOCUS_DATE_SLICE_START;
        DaysFromEpoch previous_date = days_since_epoch_add_days(root._focus_date, -7);
        days_since_epoch_to_string(previous_date, previous_focus_date_buffer);
        previous_focus_date_buffer[11] = '\0';
    }
    { // Initializes buffer for today date
        char* const today_date_buffer = root._buffer + TODAY_DATE_SLICE_START;
        days_since_epoch_to_string(root._today_date, today_date_buffer);
        today_date_buffer[11] = '\0';
    }
    { // Initializes buffer for weeks_count date
        char* const weeks_count_buffer = root._buffer + WEEKS_COUNT_SLICE_START;
        if(weeks_count < 10) {
            small_int_on_one_digit(weeks_count, weeks_count_buffer);
            weeks_count_buffer[1] = '\0';
        } else {
            small_int_on_two_digits(weeks_count, weeks_count_buffer);
            weeks_count_buffer[2] = '\0';
        }
    }

    root._buffer[BUFFER_TOTAL_LENGTH-1] = '\0';

    run(&root);

    return 1;
}

#undef BUFFER_TOTAL_LENGTH
