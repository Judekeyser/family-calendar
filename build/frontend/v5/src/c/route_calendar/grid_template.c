# include "./grid_template.h"

# include <time.h>
# include <string.h>
# include <assert.h>

# include "../shared/time_tm_to_strdate.h"
# include "../shared/debug.h"


struct Col {
    struct tm date_tm;
    char as_string[11];
    const char*(*strdate)(struct Col* col);
};

static const char* strdate(struct Col* col)
{
    char* memory = col -> as_string;

    time_tm_to_strdate(&(col -> date_tm), memory);
    memory[10] = '\0';

    return memory;
}

struct Row {
    struct Col col;
    int col_index;
    struct tm date_tm;
    struct Col*(*cols)(struct Row* row);
};

static struct Col* cols(struct Row* row)
{
    const int column_shift = row -> col_index;
    if(column_shift == 7) {
        return NULL;
    } else {
        (row -> col).date_tm = row -> date_tm;
        (row -> col).date_tm.tm_mday += column_shift;
        mktime(&((row -> col).date_tm));
        row -> col_index += 1;
        return &(row -> col);
    }
}

struct Block {
    struct Row row;
    struct Row*(*rows)(struct Block* block);
};

struct Root {
    struct Block block;
    time_t focus_tm;
    struct Block*(*blocks)(struct Root* root);
};

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

# include "../templates/calendar_grid.template.h"

# undef TMPL_T_COLS
# undef TMPL_T_ROWS
# undef TMPL_T_BLOCKS
# undef TMPL_T_ROOT

int grid_template_flush(
    const int weeks_count,
    const struct tm* focus_tm,
    const struct tm* today_tm
)
{
    struct Row row = {
        .date_tm = *focus_tm,
        .col_index = 0,
        .col = {
            .strdate = strdate
        },
        .cols = cols
    };
    simple_test(&row);
    return 1;
}