#include "./string_startsWith.h"


int string_startsWith(const char* prefix, const char* source)
{
    char c1, c2;
    do {
        c1 = *(prefix++);
        c2 = *(source++);
    } while((c1 || c2) && (c1 == c2));

    return c1 ? 0 : 1;
}
