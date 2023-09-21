#include "./string_copy.h"

/**
 * Copy blocks of memory, à la `strcpy`
 */
inline void string_copy(char* target, const char* source) {
    while((*(target++) = *(source++)));
}
