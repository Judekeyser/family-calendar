
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


# ifndef TMPL_T_APPOINTMENTS
#    error Symbol `TMPL_T_APPOINTMENTS` undefined
# endif


static const char* const appointment_list_0 = "<dl> ";
static const char* const appointment_list_1 = " <dt> <form is=\"app-hyperlink-trait\"> <input name=\"strdate\" value=\"";
static const char* const appointment_list_2 = "\"> </form> ";
static const char* const appointment_list_3 = " &#9969;&#160; ";
static const char* const appointment_list_4 = "*";
static const char* const appointment_list_5 = " </dt> <dd><app-unsafe-text data-text=\"";
static const char* const appointment_list_6 = "\"></app-unsafe-text></dd> <dd><app-unsafe-text data-text=\"";
static const char* const appointment_list_7 = "\"></app-unsafe-text></dd> ";
static const char* const appointment_list_8 = " </dl>";

static void run(TMPL_T_ROOT n0)
{


template_emit(appointment_list_0); {
TMPL_T_APPOINTMENTS n1;
for(
 int i1 = 1;
 i1 < 95 && (n1 = n0 -> appointments(n0));
 i1++
) {
             template_emit(appointment_list_1); template_emit((n1 -> strdate)(n1)); template_emit(appointment_list_2); if(!!(n1 -> is_day_off(n1))) { template_emit(appointment_list_3); } template_emit((n1 -> french_temporal_marker)(n1)); if(!!(n1 -> unread(n1))) { template_emit(appointment_list_4); } template_emit(appointment_list_5); template_emit((n1 -> b64_strdescription)(n1)); template_emit(appointment_list_6); template_emit((n1 -> b64_strdetails)(n1)); template_emit(appointment_list_7); } } template_emit(appointment_list_8);

}
