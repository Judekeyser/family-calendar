#include "./template.h"

#include <string.h>
#include <stdarg.h>
#include <assert.h>

#include "../shared/debug.h"

void id_foot_print(char* id_chunk, const char* suffix, int is, ...)
{
    static char table[] = "0123456789ABCDEFGHIJKLMNOPQRSTUV";
    assert(strlen(table) == 32);
    assert(is <= 10);
    
    memcpy(id_chunk, "id", 3);
    id_chunk += 2;
    assert(3 == strlen("2"));
    assert(*id_chunk == '\0');

    va_list args;
    va_start(args, is);
    for(int N = 0; N < is; N++) {
        int ij = va_arg(args, int);
        if(ij) {
            do {
                *(id_chunk++) = table[ij % 32];
            } while(ij /= 32);
            *(id_chunk++) = '_';
        }
    }
    va_end(args);

    memcpy(id_chunk, suffix, strlen(suffix)+1);
}

void emit_slice(const char* message)
{
    LOG("%s", message);
}