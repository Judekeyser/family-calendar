#include "./small_int_from_string.h"

#include "./assert.h"
#include "./string_length.h"


/**
 * Converts a C-string, that represents a non negative number
 * smaller than 10_000, into a integer.
 *
 * The behavior of this method on non numeric strings is unspecified.
 */
unsigned int small_int_from_string(const char* string) {
    assert(string_length(string) <= 4, "Small numeric string is too long");

    char c;

    unsigned int result = 0;
    while((c = *(string++))) {
        assert(c >= '0', "Numeric string contains characters below 0");
        assert(c <= '9', "Numeric string contains characters beyond 9");
        result = result * 10 + (c - '0');
    }
    return result;
}