#include "./small_int_from_string.h"

#include "./assert.h"
#include "./string_length.h"

#include "./unsafe/positive_int_to_unsigned_int.h"


/**
 * Converts a C-string, that represents a non negative number
 * smaller than 10_000, into a integer.
 *
 * The behavior of this method on non numeric strings is unspecified.
 */
unsigned int small_int_from_string(const char* string) {
    assert(string_length(string) <= 4, "Small numeric string is too long");

    char c;
    unsigned int counter = 0;

    unsigned int result = 0;
    while((counter++ < 4) && (c = *(string++))) {
        assert(c >= '0', "Numeric string contains characters below 0");
        assert(c <= '9', "Numeric string contains characters beyond 9");
        result = (c >= '0' && c <= '9') ? (
            result * 10u + positive_int_to_unsigned_int(c - '0')
        ) : result;
    }
    return result;
}
