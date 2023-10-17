
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


static const char* const calendar_grid_0 = "<main> ";
static const char* const calendar_grid_1 = " <section> <header> <nav> <div> <form is=\"app-hyperlink-trait\" action=\"calendar\" data-bind=\"^:click\"> <input name=\"focus_date\" value=\"";
static const char* const calendar_grid_2 = "\"> <input name=\"weeks_count\" value=\"";
static const char* const calendar_grid_3 = "\"> <input name=\"today_date\" value=\"";
static const char* const calendar_grid_4 = "\"> </form> Prec. </div> <div> <app-form-balancer data-source-bind=\"focus-date-controller:formdata\" data-sink-element=\"hyperlink\" > <label> Date d'intérêt&#160;: <app-form-value-to-data data-id=\"focus-date-controller\"> <input type=\"date\" name=\"focus_date\" value=\"";
static const char* const calendar_grid_5 = "\"> </app-form-value-to-data> </label> <form is=\"app-hyperlink-trait\" action=\"calendar\" data-id=\"hyperlink\"> <input name=\"focus_date\" value=\"\"> <input name=\"weeks_count\" value=\"";
static const char* const calendar_grid_6 = "\"> <input name=\"today_date\" value=\"";
static const char* const calendar_grid_7 = "\"> </form> </app-form-balancer> </div> <div> <form is=\"app-hyperlink-trait\" action=\"calendar\" data-bind=\"^:click\"> <input name=\"focus_date\" value=\"";
static const char* const calendar_grid_8 = "\"> <input name=\"weeks_count\" value=\"";
static const char* const calendar_grid_9 = "\"> <input name=\"today_date\" value=\"";
static const char* const calendar_grid_10 = "\"> </form> Suiv. </div> </nav> <div> <app-form-balancer data-source-bind=\"slider:formdata\" data-sink-element=\"hyperlink\" > <label> Taille de la vue:<br> <app-form-value-to-data data-id=\"slider\"> <input type=\"range\" min=\"3\" max=\"6\" name=\"weeks_count\" value=\"";
static const char* const calendar_grid_11 = "\"> </app-form-value-to-data> </label> <form is=\"app-hyperlink-trait\" action=\"calendar\" data-id=\"hyperlink\"> <input name=\"focus_date\" value=\"";
static const char* const calendar_grid_12 = "\"> <input name=\"weeks_count\" value=\"\"> <input name=\"today_date\" value=\"";
static const char* const calendar_grid_13 = "\"> </form> </app-form-balancer> </div> </header> ";
static const char* const calendar_grid_14 = " </section> </main> ";

static void run(TMPL_T_ROOT n0)
{


template_emit(calendar_grid_0); (n0 -> menu)(n0); template_emit(calendar_grid_1); template_emit((n0 -> previous_focus_strdate)(n0)); template_emit(calendar_grid_2); template_emit((n0 -> str_weeks_count)(n0)); template_emit(calendar_grid_3); template_emit((n0 -> today_strdate)(n0)); template_emit(calendar_grid_4); template_emit((n0 -> focus_strdate)(n0)); template_emit(calendar_grid_5); template_emit((n0 -> str_weeks_count)(n0)); template_emit(calendar_grid_6); template_emit((n0 -> today_strdate)(n0)); template_emit(calendar_grid_7); template_emit((n0 -> next_focus_strdate)(n0)); template_emit(calendar_grid_8); template_emit((n0 -> str_weeks_count)(n0)); template_emit(calendar_grid_9); template_emit((n0 -> today_strdate)(n0)); template_emit(calendar_grid_10); template_emit((n0 -> str_weeks_count)(n0)); template_emit(calendar_grid_11); template_emit((n0 -> focus_strdate)(n0)); template_emit(calendar_grid_12); template_emit((n0 -> today_strdate)(n0)); template_emit(calendar_grid_13); (n0 -> calendar_table)(n0); template_emit(calendar_grid_14);

}
