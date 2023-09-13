#include "./string_startsWith.h"

#include <string.h>

int string_startsWith(const char* prefix, const char* source)
{
    const unsigned int size_of_prefix = strlen(prefix);
    return size_of_prefix <= strlen(source)
        ? (memcmp(source, prefix, size_of_prefix) == 0 ? 1 : 0)
        : 0;
}
