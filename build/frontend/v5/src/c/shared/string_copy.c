#include "./string_copy.h"

/**
 * Copy blocks of memory, à la `strcpy`
 */
void string_copy(char* target, const char* source) {
    while((*(target++) = *(source++)));
}
