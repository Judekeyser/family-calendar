#include "./string_length.h"


/**
 * Returns the length of the C-string.
 */
unsigned int string_length(const char* string) {
    unsigned int length = 0;
    while(*(string++)) length++;
    return length;
}

