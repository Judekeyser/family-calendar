
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


static const char* const unread_appointments_0 = "<main> ";
static const char* const unread_appointments_1 = " <section> ";
static const char* const unread_appointments_2 = " ";
static const char* const unread_appointments_3 = " ";
static const char* const unread_appointments_4 = " ";
static const char* const unread_appointments_5 = " <p>Il n'y a pas de nouveaux rendez-vous.</p> ";
static const char* const unread_appointments_6 = " </section> </main> ";

static void run(TMPL_T_ROOT n0)
{


template_emit(unread_appointments_0); (n0 -> menu)(n0); template_emit(unread_appointments_1); if(!!(n0 -> any_appointment(n0))) { template_emit(unread_appointments_2); (n0 -> appointment_list)(n0); template_emit(unread_appointments_3); } template_emit(unread_appointments_4); if(!(n0 -> any_appointment(n0))) { template_emit(unread_appointments_5); } template_emit(unread_appointments_6);

}
