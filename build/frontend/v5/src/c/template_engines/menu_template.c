#include "./menu_template.h"

#include "../shared/prototypes.h"
#include "../shared/string_copy.h"
#include "../shared/small_int_on_one_digit.h"
#include "../shared/small_int_on_two_digits.h"

#include "../dynamic/dataframe.h"
#include "../dynamic/series.h"


struct Root {
    const unsigned int hyperlinks;

    char unread_size_buffer[4];

    unsigned char(*search)(struct Root* root);
    unsigned char(*calendar_grid)(struct Root* root);
    unsigned char(*create_appointment)(struct Root* root);
    unsigned char(*unread)(struct Root* root);
    const char*(*unread_size)(struct Root* root);
};

static unsigned char search(struct Root* root) {
    return (root -> hyperlinks) & MENU_TEMPLATE_HYPERLINK__SEARCH ? 1 : 0;
}

static unsigned char unread(struct Root* root) {
    return (root -> hyperlinks) & MENU_TEMPLATE_HYPERLINK__NEW_APPOINTMENTS ? 1 : 0;
}

static unsigned char calendar_grid(struct Root* root) {
    return (root -> hyperlinks) & MENU_TEMPLATE_HYPERLINK__BACK_TO_GRID ? 1 : 0;
}

static unsigned char create_appointment(struct Root* root) {
    return (root -> hyperlinks) & MENU_TEMPLATE_HYPERLINK__ALTER_CALENDAR ? 1 : 0;
}

static const char* unread_size_as_string(struct Root* root) {
    return root -> unread_size_buffer;
}


# define TMPL_T_ROOT struct Root*
#include "../templates/menu.template.h"


int menu_template(const unsigned int hyperlinks) {
    struct Root root = {
        .hyperlinks = hyperlinks,

        .search = search,
        .unread = unread,
        .create_appointment = create_appointment,
        .calendar_grid = calendar_grid,
        .unread_size = unread_size_as_string
    };

    { // Initialize number of reads to display
        if(root.unread(&root)) {
            unsigned int unread_size;
            {
                series_create_empty(NumericSeries, series_of_true, 0);
                series_push(&series_of_true, 1);

                Dataframe df;
                dataframe_select_isin(0, UNREAD_COLUMN_INDEX, &series_of_true, &df);
 
                series_create_from_dataframe_column(NumericSeries, series_of_unreads, &df, UNREAD_COLUMN_INDEX);
                unread_size = series_size(&series_of_unreads);
            }

            if(unread_size >= 100) {
                string_copy(root.unread_size_buffer, "99+");
            } else if(unread_size >= 10) {
                small_int_on_two_digits(unread_size, root.unread_size_buffer);
                root.unread_size_buffer[2] = '\0';
            } else {
                small_int_on_one_digit(unread_size, root.unread_size_buffer);
                root.unread_size_buffer[1] = '\0';
            }
        } else {
            root.unread_size_buffer[0] = '\0';
        }
    }

    run(&root);
    return 1;
}

#undef TMPL_T_ROOT
