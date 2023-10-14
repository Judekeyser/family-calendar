#include "./string_starts_with.h"


int string_starts_with(const char* prefix, const char* source)
{
    char c1, c2;
    do {
        c1 = *(prefix++);
        c2 = *(source++);
    } while((c1 || c2) && (c1 == c2));

    return c1 ? 0 : 1;
}
