# include "./grid_template.h"

# include "../shared/assert.h"
# include "../shared/days_since_epoch.h"
# include "../shared/date_to_string.h"


enum Component {
    COL, ROW, BLOCK, NONE
};

struct Cooperation;

// Views structure

struct Col {
    struct Cooperation* cooperation_ref;
    const char*(*strdate)(struct Col* col);
};

struct Row {
    struct Cooperation* cooperation_ref;
    struct Col*(*cols)(struct Row* row);
};

struct Block {
    struct Cooperation* cooperation_ref;
    struct Row*(*rows)(struct Block* block);
    const char*(*strmonth)(struct Block* block);
};

struct Root {
    struct Cooperation* cooperation_ref;
    struct Block*(*blocks)(struct Root* root);
};

const unsigned int BLOCK_MONTH_SHIFT = 12;


struct Cooperation {
    const struct DaysSinceEpoch focus_date;
    const struct DaysSinceEpoch today_date;
    char memory[14
        /**
        10+1 for the cell date
        2 +1 for the month on two digits
        */
    ];

    struct Root root;
    struct Block block;
    struct Row row;
    struct Col col;

    int remaining_weeks_to_print;
    unsigned int month;
    struct DaysSinceEpoch date;
    enum Component who_should_be_called;
    int must_move_col_and_rethink;
};

static void move_col_and_rethink(struct Cooperation* cooperation) {
    assert(cooperation -> must_move_col_and_rethink, "grid_template move_col_and_rethink called but must_move_col_and_rethink is false");
    cooperation -> must_move_col_and_rethink = 0;

    assert(cooperation -> who_should_be_called == COL, "grid_template move_col_and_rethink called but who_should_be_called is not COL");

    const int we_are_sunday = dse_get_wday(&(cooperation -> date)) == 6;
    dse_add_days(1, &(cooperation -> date));

    if(we_are_sunday) {
        const unsigned int date_month = dse_get_month(&(cooperation -> date));
        if(date_month != cooperation -> month) {
            cooperation -> who_should_be_called = BLOCK;
            cooperation -> month = date_month;
            dse_add_days(-7, &(cooperation -> date));
        } else {
            cooperation -> who_should_be_called = ROW;
            cooperation -> remaining_weeks_to_print--;
        }
    }

    if(cooperation -> remaining_weeks_to_print <= 0) {
        cooperation -> who_should_be_called = NONE;
    }
}

static struct Col* next_col(struct Cooperation* cooperation) {
    if(cooperation -> must_move_col_and_rethink) {
        move_col_and_rethink(cooperation);
    }
    switch(cooperation -> who_should_be_called) {
        case NONE:
        case ROW:
        case BLOCK:
            return 0;
        case COL:
            cooperation -> must_move_col_and_rethink = 1;
            return &(cooperation -> col);
    }
}

static struct Row* next_row(struct Cooperation* cooperation) {
    if(cooperation -> must_move_col_and_rethink) {
        move_col_and_rethink(cooperation);
    }
    switch(cooperation -> who_should_be_called) {
        case NONE:
        case COL:
        case BLOCK:
            return 0;
        case ROW:
            cooperation -> who_should_be_called = COL;
            return &(cooperation -> row);
    }
}

static struct Block* next_block(struct Cooperation* cooperation) {
    if(cooperation -> must_move_col_and_rethink) {
        move_col_and_rethink(cooperation);
    }
    switch(cooperation -> who_should_be_called) {
        case NONE:
        case ROW:
        case COL:
            return 0;
        case BLOCK:
            cooperation -> who_should_be_called = ROW;
            return &(cooperation -> block);
    }
}

static const char* get_strdate(struct Cooperation* cooperation) {
    char* memory = cooperation -> memory;
    memory[11] = '\0';
    if(cooperation -> month == dse_get_month(&(cooperation -> date))) {
        date_to_string(&(cooperation -> date), memory);
    } else {
        memory[0] = '\0';
    }
    return memory;
}

static const char* get_strmonth(struct Cooperation* cooperation) {
    char* memory = (cooperation -> memory) + BLOCK_MONTH_SHIFT;
    const unsigned int month = cooperation -> month;
    memory[0] = (month / 10) + '0';
    memory[1] = (month % 10) + '0';
    memory[2] = '\0';
    return memory;
}


static inline struct Col* cols(struct Row* row)
    { return next_col(row -> cooperation_ref); }

static inline struct Row* rows(struct Block* block)
    { return next_row(block -> cooperation_ref); }

static inline struct Block* blocks(struct Root* root)
    { return next_block(root -> cooperation_ref); }

static inline const char* strdate(struct Col* col)
    { return get_strdate(col -> cooperation_ref); }

static inline const char* strmonth(struct Block* block)
    { return get_strmonth(block -> cooperation_ref); }


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

# include "../templates/calendar_grid_rows.template.h"

# undef TMPL_T_COLS
# undef TMPL_T_ROWS
# undef TMPL_T_BLOCKS
# undef TMPL_T_ROOT

int grid_template_flush(
    const int week_count,
    const struct DaysSinceEpoch* focus_date,
    const struct DaysSinceEpoch* today_date
)
{
    assert(today_date, "grid_template grid_template_flush no today_day given");
    struct Cooperation cooperation = {
        .focus_date = *focus_date,
        .today_date = *today_date,

        /* .date_tm set later as Monday */
        .remaining_weeks_to_print = week_count,
        .month = dse_get_month(focus_date),
        .who_should_be_called = BLOCK,

        /* Companion structs */
        .root = { .blocks = blocks },
        .block = { .rows = rows, .strmonth = strmonth },
        .row = { .cols = cols },
        .col = { .strdate = strdate }
    };

    cooperation.root.cooperation_ref = &cooperation;
    cooperation.block.cooperation_ref = &cooperation;
    cooperation.row.cooperation_ref = &cooperation;
    cooperation.col.cooperation_ref = &cooperation;

    // Rectify to Monday
    cooperation.date = cooperation.focus_date;
    dse_add_days(-((int) dse_get_wday(focus_date)), &(cooperation.date));
    assert(dse_get_wday(&(cooperation.date)) == 0, "grid_template grid_template_flush rectified day is not a Monday");

    run(&(cooperation.root));

    return 1;
}