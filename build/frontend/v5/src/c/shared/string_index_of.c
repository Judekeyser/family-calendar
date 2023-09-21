#include "./string_index_of.h"

#include "./assert.h"

/**
 * Returns a pointer to the substring of passed string, that starts with
 * the provided charcater. NULL is returned if no such substring exists.
 */
const char* string_index_of(const char* string, const char match) {
    char c;
    while((c = *(string++)) && (c != match));
    assert(c == match || c == '\0', "string_index_of loop end condition is wrong");
    return c == match ? (string - 1) : 0;
}
