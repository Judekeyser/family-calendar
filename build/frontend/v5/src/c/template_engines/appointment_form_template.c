#include "./appointment_form_template.h"

#include "../shared/assert.h"
#include "../dynamic/series.h"
#include "../shared/string_length.h"
#include "../shared/string_copy.h"
#include "../shared/date_string.h"
#include "../shared/time_slot_string.h"
#include "../shared/french_format.h"
#include "../shared/b64_encode_string_to_string.h"

#include "../shared/unsafe/positive_int_to_unsigned_int.h"


struct Root {
    char _dummy[1];
    const char*(*dummy)(struct Root* self);
};

const char* dummy(struct Root* self) {
    return self -> _dummy;
}


#define TMPL_T_ROOT struct Root*

#include "../templates/appointment_form.template.h"


int appointment_form_template(void) {
    struct Root root = { ._dummy = "", .dummy = dummy };

    run(&root);

    return 0;
}
