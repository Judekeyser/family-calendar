#include "./date_string.h"

#include "./assert.h"
#include "./string_length.h"
#include "./buffer_copy.h"
#include "./small_int_from_string.h"
#include "./small_int_on_two_digits.h"
#include "./unsafe/positive_int_to_unsigned_int.h"


static inline unsigned int char_to_int(char c) {
    return positive_int_to_unsigned_int(
        (c >= '0' && c <= '9') ? (c - '0') : 0
    );
}


unsigned int date_string_get_year(DateString* date_string) {
    const char* buffer = UNWRAP(*date_string);
    unsigned int stack = 0;
    stack += char_to_int(*(buffer + 0)) * 1000;
    stack += char_to_int(*(buffer + 1)) *  100;
    stack += char_to_int(*(buffer + 2)) *   10;
    stack += char_to_int(*(buffer + 3)) *    1;
    return stack;
}

unsigned int date_string_get_month(DateString* date_string) {
    const char* buffer = UNWRAP(*date_string);
    unsigned int stack = 0;
    stack += char_to_int(*(buffer + 5)) *   10;
    stack += char_to_int(*(buffer + 6)) *    1;
    return stack;
}

unsigned int date_string_get_mday(DateString* date_string) {
    const char* buffer = UNWRAP(*date_string);
    unsigned int stack = 0;
    stack += char_to_int(*(buffer + 8)) *   10;
    stack += char_to_int(*(buffer + 9)) *    1;
    return stack;
}

void date_string_from_triple(unsigned int year, unsigned int month, unsigned int day, DateString* date_string) {
    char* buffer = UNWRAP(*date_string);

    small_int_on_two_digits(year / 100u, buffer);
    small_int_on_two_digits(year % 100u, buffer + 2);
    small_int_on_two_digits(month, buffer + 5);
    small_int_on_two_digits(day, buffer + 8);

    buffer[4] = '-';
    buffer[7] = '-';
    buffer[10] = '\0';
}

void date_string_initialize_from_buffer(
    DateString* date_string,
    const char* buffer
) {
    char* sink = UNWRAP(*date_string);
    assert(string_length(buffer) == 10, "`date_string_initialize_from_buffer` buffer argument has not size 10");
    buffer_copy(sink, buffer, 10);
    sink[10] = '\0';
}

const char* date_string_open_buffer(const DateString* date_string) {
    return UNWRAP(*date_string);
}
