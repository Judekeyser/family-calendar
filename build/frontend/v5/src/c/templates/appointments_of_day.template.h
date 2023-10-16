
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


static const char* const appointments_of_day_0 = "<main> ";
static const char* const appointments_of_day_1 = " <section> ";
static const char* const appointments_of_day_2 = " ";
static const char* const appointments_of_day_3 = " ";
static const char* const appointments_of_day_4 = " ";
static const char* const appointments_of_day_5 = " <p>Il n'y a pas de rendez-vous prévu à ce jour.</p> ";
static const char* const appointments_of_day_6 = " </section> </main> ";

static void run(TMPL_T_ROOT n0)
{


template_emit(appointments_of_day_0); (n0 -> menu)(n0); template_emit(appointments_of_day_1); if(!!(n0 -> any_appointment(n0))) { template_emit(appointments_of_day_2); (n0 -> appointment_list)(n0); template_emit(appointments_of_day_3); } template_emit(appointments_of_day_4); if(!(n0 -> any_appointment(n0))) { template_emit(appointments_of_day_5); } template_emit(appointments_of_day_6);

}
