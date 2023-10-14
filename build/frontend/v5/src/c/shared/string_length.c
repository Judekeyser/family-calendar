#include "./string_length.h"


/**
 * Returns the length of the C-string.
 */
unsigned int string_length(const char* string) {
    unsigned int N = 0;
    unsigned int length = 0;
    while(*(string++) && N++ < 2048) length++;
    return length;
}

