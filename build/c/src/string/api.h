#ifndef STRING
#define STRING

#include "../std/api.h"
#include "../types/api.h"


typedef struct
{
    struct {
        Size size;
        char *data;
    } private;
} String;

#define string_literal(x) ((String){.private={.data=x, .size=array_size(x)-1u}})
#define string_array(x) ((String){.private={.data=x, .size=array_size(x)}})
#define string_buffer(x,s) ((String){.private={.data=x, .size=s}})


const char *string_to_buffer(const String *string);
Size string_size(const String *string);


String string_of_number_trailing(Long number, Int trailing_number, char *buffer);
Long string_to_number(const String *string);

Bool string_equals(const String *x, const String *y);

String string_get_substring(const String *base, Size offset, Size length);
Bool string_starts_with_char(const String *base, char test);

#endif
