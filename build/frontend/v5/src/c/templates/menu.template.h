
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


static const char* const menu_0 = "<nav> <menu> ";
static const char* const menu_1 = " <li> <form is=\"app-hyperlink-trait\" action=\"calendar\"></form> &#128197; </li> ";
static const char* const menu_2 = " ";
static const char* const menu_3 = " <li> <form is=\"app-hyperlink-trait\" action=\"calendar/new-appointment\"></form> &#10133; </li> ";
static const char* const menu_4 = " ";
static const char* const menu_5 = " <li> <form is=\"app-hyperlink-trait\" action=\"search\"></form> &#128270; </li> ";
static const char* const menu_6 = " ";
static const char* const menu_7 = " <li> <form is=\"app-hyperlink-trait\" action=\"appointments/unread\"></form> &#128276; (";
static const char* const menu_8 = ") </li> ";
static const char* const menu_9 = " </menu> </nav> ";

static void run(TMPL_T_ROOT n0)
{


template_emit(menu_0); if(!!(n0 -> calendar_grid(n0))) { template_emit(menu_1); } template_emit(menu_2); if(!!(n0 -> create_appointment(n0))) { template_emit(menu_3); } template_emit(menu_4); if(!!(n0 -> search(n0))) { template_emit(menu_5); } template_emit(menu_6); if(!!(n0 -> unread(n0))) { template_emit(menu_7); template_emit((n0 -> unread_size)(n0)); template_emit(menu_8); } template_emit(menu_9);

}
