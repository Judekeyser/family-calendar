#include "api.h"


void* memcpy(void *restrict dest, const void *restrict src, size_t count)
{
    unsigned char *restrict c_dest = dest;
    const unsigned char *restrict c_src = src;

    while(count--)
        *(c_dest++) = *(c_src++);

    return dest;
}

void* memset(void *restrict dest, const int ch, size_t count)
{
    unsigned char *restrict c_dest = dest;
    const unsigned char c_ch = (unsigned char)ch;

    while(count--)
        *(c_dest++) = c_ch;

    return dest;
}
