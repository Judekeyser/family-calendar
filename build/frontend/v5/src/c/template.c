#include "./template.h"

#include <stdarg.h>

#include "./shared/assert.h"
#include "./shared/string_length.h"
#include "./shared/string_copy.h"
#include "./ioserver.h"


static const char* const E_SL = "E_SL:";
static const char* const E_ID = "E_ID:";
static const char* const E_ATTR = "E_ATTR:";
static const char* const E_CLS = "E_CLS:";

static const char* const SEPARATOR = ":";


void template_id_footprint(char* id_chunk, const char* suffix, int is, ...)
{
    static char table[] = "0123456789ABCDEFGHIJKLMNOPQRSTUV";
    assert(is <= 10, "template template_id_footprint too long is parameter. Max depth reached");
    
    string_copy(id_chunk, "id");
    id_chunk += 2;

    va_list args;
    va_start(args, is);
    for(int N = 0; N < is; N++) {
        int ij = va_arg(args, int);
        if(ij) {
            do {
                *(id_chunk++) = table[ij % 32];
            } while(ij /= 32);
            *(id_chunk++) = '_';
        }
    }
    va_end(args);

    string_copy(id_chunk, suffix);
}

int template_emit(const char* raw_string) {
    ioserver_open();
    return (
        ioserver_stack_string(raw_string)
    ) || ioserver_commit();
}

int template_emit_fragment(const char* fragment_identifier) {
    ioserver_open();
    return (
        ioserver_stack_string(E_SL) ||
        ioserver_stack_string(fragment_identifier)
    ) || ioserver_commit();
}

int template_emit_uuid(const char* element_identifier) {
    ioserver_open();
    return (
        ioserver_stack_string(E_ID) ||
        ioserver_stack_string(element_identifier)
    ) || ioserver_commit();
}

int template_emit_attribute(const char* element_identifier, const char* attribute_name, const char* value) {
    ioserver_open();
    return (
        ioserver_stack_string(E_ATTR) ||
        ioserver_stack_string(element_identifier) ||
        ioserver_stack_string(SEPARATOR) ||
        ioserver_stack_string(attribute_name) ||
        ioserver_stack_string(SEPARATOR) ||
        ioserver_stack_string(value)
    ) || ioserver_commit();
}

int template_emit_class(const char* elementUuid, const char* value) {
    ioserver_open();
    return (
        ioserver_stack_string(E_CLS) ||
        ioserver_stack_string(elementUuid) ||
        ioserver_stack_string(SEPARATOR) ||
        ioserver_stack_string(value)
    ) || ioserver_commit();
}
