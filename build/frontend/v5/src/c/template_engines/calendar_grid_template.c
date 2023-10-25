#include "./calendar_grid_template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"
#include "../shared/string_copy.h"
#include "../shared/date_string.h"
#include "../shared/days_since_epoch.h"
#include "../shared/small_int_on_two_digits.h"
#include "../shared/small_int_on_one_digit.h"
#include "../dynamic/series.h"

#include "./calendar_table_template.h"
#include "./menu_template.h"


// Views structure
struct Root;

struct UnreadNavigation {
    const char*(*size)(const struct UnreadNavigation* self);
};

struct Root {
    const DaysFromEpoch _focus_date;
    const DaysFromEpoch _today_date;

    const DateStringSeries* days_to_display;
    const NumericSeries* has_appointments;
    const NumericSeries* unreads;
    const NumericSeries* isdayoffs;

    char _weeks_count_buffer[3];
    DateString focus_date_string;
    DateString today_date_string;
    DateString next_focus_date_string;
    DateString previous_focus_date_string;

    void(*calendar_table)(const struct Root* self);
    void(*menu)(const struct Root* self);
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

static void menu(const struct Root* self) {
    UNUSED(self);
    menu_template(
        MENU_TEMPLATE_HYPERLINK__SEARCH | MENU_TEMPLATE_HYPERLINK__NEW_APPOINTMENTS | MENU_TEMPLATE_HYPERLINK__ALTER_CALENDAR
    );
}

static const char* str_weeks_count(const struct Root* self) {
    return self -> _weeks_count_buffer;
}

static const char* today_strdate(const struct Root* self) {
    return date_string_open_buffer(&(self -> today_date_string));
}

static const char* next_focus_strdate(const struct Root* self) {
    return date_string_open_buffer(&(self -> next_focus_date_string));
}

static const char* focus_strdate(const struct Root* self) {
    return date_string_open_buffer(&(self -> focus_date_string));
}

static const char* previous_focus_strdate(const struct Root* self) {
    return date_string_open_buffer(&(self -> previous_focus_date_string));
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
    const DateStringSeries* days_to_display,
    const NumericSeries* has_appointments_series,
    const NumericSeries* unreads,
    const NumericSeries* isdayoffs
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
        .menu = menu,
        .today_strdate = today_strdate,
        .focus_strdate = focus_strdate,
        .next_focus_strdate = next_focus_strdate,
        .previous_focus_strdate = previous_focus_strdate,
        .str_weeks_count = str_weeks_count
    };

    { // Initializes buffer for focus date
        date_string_from_days_from_epoch(root._focus_date, &root.focus_date_string);
    }
    { // Initializes buffer for next focus date
        DaysFromEpoch next_date = days_since_epoch_add_days(root._focus_date, 7);
        date_string_from_days_from_epoch(next_date, &root.next_focus_date_string);
    }
    { // Initializes buffer for previous focus date
        DaysFromEpoch previous_date = days_since_epoch_add_days(root._focus_date, -7);
        date_string_from_days_from_epoch(previous_date, &root.previous_focus_date_string);
    }
    { // Initializes buffer for today date
        date_string_from_days_from_epoch(root._today_date, &root.today_date_string);
    }
    { // Initializes buffer for weeks_count date
        char* const weeks_count_buffer = root._weeks_count_buffer;
        if(weeks_count < 10) {
            small_int_on_one_digit(weeks_count, weeks_count_buffer);
            weeks_count_buffer[1] = '\0';
        } else {
            small_int_on_two_digits(weeks_count, weeks_count_buffer);
            weeks_count_buffer[2] = '\0';
        }
    }

    run(&root);

    return 1;
}
