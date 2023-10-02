#include "./string_equals.h"


int string_equals(const char* a, const char* b)
{
    char c1, c2;
    do {
        c1 = *(a++);
        c2 = *(b++);
    } while((c1 || c2) && (c1 == c2));
    
    return (c1 || c2) ? 0 : 1;
}
