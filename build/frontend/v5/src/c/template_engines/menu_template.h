# ifndef APP_ROUTE_MENU_TEMPLATE
# define APP_ROUTE_MENU_TEMPLATE


const static unsigned int           MENU_TEMPLATE_HYPERLINK__SEARCH = 1 << 0;
const static unsigned int MENU_TEMPLATE_HYPERLINK__NEW_APPOINTMENTS = 1 << 1;
const static unsigned int   MENU_TEMPLATE_HYPERLINK__ALTER_CALENDAR = 1 << 2;
const static unsigned int     MENU_TEMPLATE_HYPERLINK__BACK_TO_GRID = 1 << 3;


int menu_template(const unsigned int hyperlinks);

# endif 
