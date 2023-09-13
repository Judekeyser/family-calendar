#include "./string_equals.h"

#include <string.h>


inline int string_equals(const char* a, const char* b)
{
    return strcmp(a,b) == 0 ? 1 : 0;
}