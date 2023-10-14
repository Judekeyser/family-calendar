#include "./calendar_table_template.h"

#include "../shared/assert.h"

#include "../shared/string_length.h"
#include "../shared/string_copy.h"
#include "../shared/days_since_epoch.h"
#include "../shared/days_since_epoch_to_string.h"
#include "../shared/days_since_epoch_from_string.h"
#include "../shared/date_string.h"
#include "../shared/month_to_french.h"
#include "../shared/small_int_on_two_digits.h"
#include "../dynamic/series.h"


// Views structure
struct Cooperation;

struct Col {
    struct Cooperation* cooperation_ref;
    const char*(*strdate)(const struct Col* col);
    const char*(*strday)(const struct Col* col);
    unsigned char(*has_appointments)(const struct Col* col);
    unsigned char(*is_today)(const struct Col* col);
    unsigned char(*is_focus)(const struct Col* col);
    unsigned char(*is_day_off)(const struct Col* col);
    unsigned char(*has_unread)(const struct Col* col);
};

struct Row {
    struct Cooperation* cooperation_ref;
    struct Col*(*cols)(struct Row* row);
};

struct Block {
    struct Cooperation* cooperation_ref;
    struct Row*(*rows)(struct Block* block);
    const char*(*strmonth)(const struct Block* block);
};

struct Root {
    struct Cooperation* cooperation_ref;
    struct Block*(*blocks)(struct Root* root);
};


struct Cooperation {
    const DaysFromEpoch focus_date;
    const DaysFromEpoch today_date;

    const StringSeries* days_to_display;
    const NumericSeries* has_appointments;
    const NumericSeries* unreads;
    const NumericSeries* isdayoffs;

    unsigned int displayed_days_so_far;
    unsigned int opened_month;
    char current_date_string[11];
    char current_str_month[3];
    char current_str_day[3];
    unsigned char current_has_appointments;
    unsigned char current_has_unread;
    unsigned char current_is_day_off;
    unsigned char current_is_today;
    unsigned char current_is_focus;

    struct Root root;
    struct Block block;
    struct Row row;
    struct Col col;
};

/** Template bindings */

static struct Col* open_empty_col(struct Row* row) { assert(row, "open_empty_row on null row"); return (void*)(row ? 0 : 0); }
static struct Row* open_empty_row(struct Block* block) { assert(block, "open_empty_block on null block"); return (void*)(block ? 0 : 0); }
static struct Block* open_empty_block(struct Root* root) { assert(root, "open_empty_root on null root"); return (void*)(root ? 0 : 0); }

static struct Col* open_column(struct Row* row);

static struct Row* open_self_row(struct Block* block) {
    struct Cooperation* cooperation_ref = block -> cooperation_ref;
    (cooperation_ref -> row).cols = open_column;
    return &(cooperation_ref -> row);
}
static struct Block* open_self_block(struct Root* root) {
    struct Cooperation* cooperation_ref = root -> cooperation_ref;
    (cooperation_ref -> block).rows = open_self_row;
    return &(cooperation_ref -> block);
}

static struct Col* open_column(struct Row* row) {
    /**
     * Opening a column means to increament the displayed_days_so_far
     * and providing access to the date to visit. The date is stored.
     * Every information about the current cell must be stored now (no lazy values)
     * because of the counter dynamic.
     */
    struct Cooperation* cooperation_ref = row -> cooperation_ref;

    const unsigned int counter = cooperation_ref -> displayed_days_so_far;

    DaysFromEpoch fetched_date; {
        series_get(
            cooperation_ref -> days_to_display, counter,
            cooperation_ref -> current_date_string, 11
        );
        assert(string_length(cooperation_ref -> current_date_string) == 10, "cooperation.current_date_string from series whould be of length 10");
        DateString date_string;
        date_string_initialize_from_buffer(&date_string, cooperation_ref -> current_date_string);
        fetched_date = days_since_epoch_from_string(&date_string);
    }
    const unsigned int fetched_month = days_since_epoch_get_month(fetched_date);

    if(fetched_month != cooperation_ref -> opened_month) {
        (cooperation_ref -> current_date_string)[0] = '\0';
        (cooperation_ref -> current_str_day)[0] = '\0';
        cooperation_ref -> current_has_unread = 0;
        cooperation_ref -> current_is_day_off = 0;
        cooperation_ref -> current_has_appointments = 0;
        cooperation_ref -> current_is_today = 0;
        cooperation_ref -> current_is_focus = 0;
    } else {
        cooperation_ref -> current_has_unread = !!series_get(
            cooperation_ref -> unreads, counter
        );
        cooperation_ref -> current_is_day_off = !!series_get(
            cooperation_ref -> isdayoffs, counter
        );
        cooperation_ref -> current_has_appointments = !!series_get(
            cooperation_ref -> has_appointments, counter
        );
        cooperation_ref -> current_is_focus = days_since_epoch_equals(fetched_date, cooperation_ref -> focus_date);
        cooperation_ref -> current_is_today = days_since_epoch_equals(fetched_date, cooperation_ref -> today_date);
        string_copy(cooperation_ref -> current_str_day, (cooperation_ref -> current_date_string) + 8);
    }

    if(days_since_epoch_get_wday(fetched_date) == 6 /* Sunday */) {
        /*
         * This is end of the week. For sure, there is no column anymore to fetch (1).
         * We need to decide if there is a next row, and if the next row is in the same block.
         *
         * If the fetched month is not the month of the block (2),
         * it means we ended the week with days left to be displayed, in another block.
         *
         * We thus should:
         *  - terminate the row
         *  - go back in time by 7 days
         *  - increment the month
         *  - allow opening of a new block
         *
         * When it is not the case (3), we end the week on a day that belongs to the month.
         * 
         * We thus should:
         *  - check if they are days left to display:
         *      - if not, we must turn everything to empty
         *      - if yes, we must check if the next day is still in the month.
         *          (This can be done without fetching the actual day)
         */
        
        (cooperation_ref -> row).cols = open_empty_col; // (1)

        if(fetched_month != cooperation_ref -> opened_month) { // (2)
            (cooperation_ref -> block).rows = open_empty_row;
            cooperation_ref -> displayed_days_so_far -= 7;
            cooperation_ref -> opened_month = ((cooperation_ref -> opened_month) % 12) + 1;
            (cooperation_ref -> root).blocks = open_self_block;
        } else { // (3)
            if((cooperation_ref -> displayed_days_so_far)+1 >= series_size(cooperation_ref -> days_to_display)) {
                (cooperation_ref -> root).blocks = open_empty_block;
                (cooperation_ref -> block).rows = open_empty_row;
            } else {
                fetched_date = days_since_epoch_add_days(fetched_date, 1);
                if(days_since_epoch_get_month(fetched_date) != (cooperation_ref -> opened_month)) {
                    (cooperation_ref -> root).blocks = open_self_block;
                    (cooperation_ref -> block).rows = open_empty_row;
                    cooperation_ref -> opened_month = ((cooperation_ref -> opened_month) % 12) + 1;
                }
            }
        }
    }

    cooperation_ref -> displayed_days_so_far += 1;
    return &(cooperation_ref -> col);
}

static struct Block* open_initial_block(struct Root* root) {
    /**
     * During first initial block to open, we need to set the month to
     * the month of the focus date. The number of displayed days is 0.
     */
    struct Cooperation* cooperation_ref = root -> cooperation_ref;

    cooperation_ref -> opened_month = days_since_epoch_get_month(cooperation_ref -> focus_date);
    cooperation_ref -> displayed_days_so_far = 0;

    (cooperation_ref -> root).blocks = open_self_block;
    (cooperation_ref -> block).rows = open_self_row;
    return open_self_block(root);
}

static const char* strmonth(const struct Block* block) {
    return month_to_french(block -> cooperation_ref -> opened_month);
}

static const char* strdate(const struct Col* col) {
    return col -> cooperation_ref -> current_date_string;
}

static const char* strday(const struct Col* col) {
    return col -> cooperation_ref -> current_str_day;
}

static unsigned char has_unread(const struct Col* col) {
    return col -> cooperation_ref -> current_has_unread;
}

static unsigned char is_day_off(const struct Col* col) {
    return col -> cooperation_ref -> current_is_day_off;
}

static unsigned char has_appointments(const struct Col* col) {
    return col -> cooperation_ref -> current_has_appointments;
}

static unsigned char is_focus(const struct Col* col) {
    return col -> cooperation_ref -> current_is_focus;
}

static unsigned char is_today(const struct Col* col) {
    return col -> cooperation_ref -> current_is_today;
}


# ifdef TMPL_T_ROOT
#   error Symbol `TMPL_T_ROOT` already defined
# endif
# define TMPL_T_ROOT struct Root*

# ifdef TMPL_T_BLOCKS
#  error Symbol `TMPL_T_BLOCKS` already defined
# endif
# define TMPL_T_BLOCKS struct Block*

# ifdef TMPL_T_ROWS
#  error Symbol `TMPL_T_ROWS` already defined
# endif
# define TMPL_T_ROWS struct Row*

# ifdef TMPL_T_COLS
#  error Symbol `TMPL_T_COLS` already defined
# endif
# define TMPL_T_COLS struct Col*

# include "../templates/calendar_table.template.h"

# undef TMPL_T_COLS
# undef TMPL_T_ROWS
# undef TMPL_T_BLOCKS
# undef TMPL_T_ROOT

int calendar_table_template(
    DaysFromEpoch focus_date,
    DaysFromEpoch today_date,
    const StringSeries* days_to_display,
    const NumericSeries* has_appointments_series,
    const NumericSeries* unreads,
    const NumericSeries* isdayoffs
)
{
    assert(days_to_display, "table_template `days_to_display` series undefined");
    assert(has_appointments_series, "table_template `has_appointments_series` series undefined");
    assert(unreads, "table_template `unreads` series undefined");
    assert(isdayoffs, "table_template `isdayoffs` series undefined");

    struct Cooperation cooperation = {
        /* Starting points */
        .focus_date = focus_date,
        .today_date = today_date,
        .days_to_display = days_to_display,
        .unreads = unreads,
        .isdayoffs = isdayoffs,
        .has_appointments = has_appointments_series,

        /* Companion structs */
        .block = {
            .strmonth = strmonth
        },
        .col = {
            .strdate = strdate,
            .strday = strday,
            .has_appointments = has_appointments,
            .has_unread = has_unread,
            .is_today = is_today,
            .is_focus = is_focus,
            .is_day_off = is_day_off
        }
    };

    cooperation.root.cooperation_ref = &cooperation;
    cooperation.block.cooperation_ref = &cooperation;
    cooperation.row.cooperation_ref = &cooperation;
    cooperation.col.cooperation_ref = &cooperation;

    cooperation.root.blocks = open_initial_block;
    cooperation.block.rows = open_empty_row;
    cooperation.row.cols = open_empty_col;

    run(&(cooperation.root));

    return 1;
}
