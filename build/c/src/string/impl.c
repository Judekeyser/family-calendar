#include "./api.h"


inline const char *string_buffer(const String *string)
{
    return (string->__).data;
}

inline Size string_size(const String *string)
{
    return (string->__).size;
}

static void bytes_reverse(char *buffer, Size size)
{
    const Size half = size/2u;
    char tmp;
    for(Size i = 0; i < half; i++) {
        tmp = buffer[i];
        buffer[i] = buffer[size - 1u - i];
        buffer[size - 1u - i] = tmp;
    }
}

String string_of_number_trailing(Long number, Int trailing_number, char *buffer)
{
    Size length = 0u;
    if(number == 0) {
        buffer[length++] = '0';
    } else {
        while(number != 0) {
            buffer[length++] = '0' + (number % 10lu);
            number /= 10u;
        }
        while(length < trailing_number) {
            buffer[length++] = '0';
        }
        bytes_reverse(buffer, length);
    }
    return string_buffer(buffer, length);
}

Long string_to_number(const String *string)
{
    const Tiny zero = (Tiny) '0';
    const char *data = string_buffer(*string);
    const Size size = string_size(string);

    Long result = 0lu;
    for(Size i = 0u; i < size; i++) {
        result *= 10lu;
        result += ((Tiny)data[i] - zero) % 10lu;
    }
    return result;
}


Bool string_equals(const String *x, const String *y)
{
    const Size x_size = string_size(x);
    const Size y_size = string_size(y);

    if(x_size == y_size) {
        const char *a = string_buffer(x);
        const char *b = string_buffer(y);
        if(a && b) {
            if(a == b) {
                return 1;
            } else {
                for(Size i = 0u; i < x_size; i++) {
                    if(a[i] != b[i]) {
                        return 0;
                    }
                }
                return 1;
            }
        }
    }
    return 0;
}

String string_get_substring(const String *base, Size offset, Size length)
{
    const Size base_size = string_size(base);

    offset = MIN(base_size, offset);
    length = MIN(length, base_size-offset);

    return string_buffer(base.private.data+offset, length);
}

Bool string_starts_with_char(const String *base, char test)
{
    const char *data = string_buffer(base);
    return string_size(base) ? (data[0] == test) : 0;
}
