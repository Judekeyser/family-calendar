
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


# ifndef TMPL_T_BLOCKS
#    error Symbol `TMPL_T_BLOCKS` undefined
# endif


# ifndef TMPL_T_ROWS
#    error Symbol `TMPL_T_ROWS` undefined
# endif


# ifndef TMPL_T_COLS
#    error Symbol `TMPL_T_COLS` undefined
# endif


static const char* const calendar_table_0 = "<table> <thead> <tr> <th><abbr>Lun.</abbr></th> <th><abbr>Mar.</abbr></th> <th><abbr>Mer.</abbr></th> <th><abbr>Jeu.</abbr></th> <th><abbr>Ven.</abbr></th> <th><abbr>Sam.</abbr></th> <th><abbr>Dim.</abbr></th> </tr> </thead> ";
static const char* const calendar_table_1 = " <tbody> <tr class=\"monthTitle\"> <th colspan=\"7\">";
static const char* const calendar_table_2 = "</th> </tr> ";
static const char* const calendar_table_3 = " <tr> ";
static const char* const calendar_table_4 = " <td class=\" ";
static const char* const calendar_table_5 = "hasAppointments";
static const char* const calendar_table_6 = " ";
static const char* const calendar_table_7 = "isToday";
static const char* const calendar_table_8 = " ";
static const char* const calendar_table_9 = "isFocus";
static const char* const calendar_table_10 = " \"> <form is=\"app-hyperlink-trait\" action=\"appointments/day\" data-bind=\"^:click\"> <input name=\"focus_date\" value=\"";
static const char* const calendar_table_11 = "\"> </form> ";
static const char* const calendar_table_12 = "&#9969;";
static const char* const calendar_table_13 = "*";
static const char* const calendar_table_14 = " </td> ";
static const char* const calendar_table_15 = " </tr> ";
static const char* const calendar_table_16 = " </tbody> ";
static const char* const calendar_table_17 = " </table>";

static void run(TMPL_T_ROOT n0)
{


template_emit(calendar_table_0); {
TMPL_T_BLOCKS n1;
for(
 int i1 = 1;
 i1 < 95 && (n1 = n0 -> blocks(n0));
 i1++
) {
             template_emit(calendar_table_1); template_emit((n1 -> strmonth)(n1)); template_emit(calendar_table_2); {
TMPL_T_ROWS n2;
for(
 int i2 = 1;
 i2 < 95 && (n2 = n1 -> rows(n1));
 i2++
) {
             template_emit(calendar_table_3); {
TMPL_T_COLS n3;
for(
 int i3 = 1;
 i3 < 95 && (n3 = n2 -> cols(n2));
 i3++
) {
             template_emit(calendar_table_4); if(!!(n3 -> has_appointments(n3))) { template_emit(calendar_table_5); } template_emit(calendar_table_6); if(!!(n3 -> is_today(n3))) { template_emit(calendar_table_7); } template_emit(calendar_table_8); if(!!(n3 -> is_focus(n3))) { template_emit(calendar_table_9); } template_emit(calendar_table_10); template_emit((n3 -> strdate)(n3)); template_emit(calendar_table_11); if(!(n3 -> is_day_off(n3))) { template_emit((n3 -> strday)(n3)); } if(!!(n3 -> is_day_off(n3))) { template_emit(calendar_table_12); } if(!!(n3 -> has_unread(n3))) { template_emit(calendar_table_13); } template_emit(calendar_table_14); } } template_emit(calendar_table_15); } } template_emit(calendar_table_16); } } template_emit(calendar_table_17);

}
