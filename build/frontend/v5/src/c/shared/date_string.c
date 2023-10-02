#include "./date_string.h"

#include "./small_int_from_string.h"
#include "./small_int_on_two_digits.h"
#include "./unsafe/positive_int_to_unsigned_int.h"


static inline unsigned int char_to_int(const char c) {
    return positive_int_to_unsigned_int(
        (c >= '0' && c <= '9') ? (c - '0') : 0
    );
}


unsigned int date_string_get_year(const char* date_string) {
    unsigned int stack = 0;
    stack += char_to_int(*(date_string + 0)) * 1000;
    stack += char_to_int(*(date_string + 1)) *  100;
    stack += char_to_int(*(date_string + 2)) *   10;
    stack += char_to_int(*(date_string + 3)) *    1;
    return stack;
}

unsigned int date_string_get_month(const char* date_string) {
    unsigned int stack = 0;
    stack += char_to_int(*(date_string + 5)) *   10;
    stack += char_to_int(*(date_string + 6)) *    1;
    return stack;
}

unsigned int date_string_get_mday(const char* date_string) {
    unsigned int stack = 0;
    stack += char_to_int(*(date_string + 8)) *   10;
    stack += char_to_int(*(date_string + 9)) *    1;
    return stack;
}

void date_string_from_triple(unsigned int year, unsigned int month, unsigned int day, char* buffer) {
    small_int_on_two_digits(year / 100u, buffer);
    small_int_on_two_digits(year % 100u, buffer + 2);
    small_int_on_two_digits(month, buffer + 5);
    small_int_on_two_digits(day, buffer + 8);

    buffer[4] = '-';
    buffer[7] = '-';
    buffer[10] = '\0';
}
