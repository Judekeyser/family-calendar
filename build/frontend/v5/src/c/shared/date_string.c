#include "./date_string.h"

#include "./assert.h"
#include "./string_length.h"
#include "./small_int_from_string.h"
#include "./small_int_on_two_digits.h"
#include "./unsafe/positive_int_to_unsigned_int.h"


static unsigned int char_to_int(char c) {
    return positive_int_to_unsigned_int(
        (c >= '0' && c <= '9') ? (c - '0') : 0
    );
}

static unsigned int get_year(const char* buffer) {
    unsigned int stack = 0;
    stack += char_to_int(*(buffer + 0)) * 1000;
    stack += char_to_int(*(buffer + 1)) *  100;
    stack += char_to_int(*(buffer + 2)) *   10;
    stack += char_to_int(*(buffer + 3)) *    1;
    return stack;
}

static unsigned int get_month(const char* buffer) {
    unsigned int stack = 0;
    stack += char_to_int(*(buffer + 5)) *   10;
    stack += char_to_int(*(buffer + 6)) *    1;
    return stack;
}

static unsigned int get_mday(const char* buffer) {
    unsigned int stack = 0;
    stack += char_to_int(*(buffer + 8)) *   10;
    stack += char_to_int(*(buffer + 9)) *    1;
    return stack;
}

DaysFromEpoch date_string_to_days_from_epoch(DateString* date_string) {
    const char* buffer = UNWRAP(*date_string);
    const unsigned int numeric_year = get_year(buffer);
    const unsigned int numeric_month = get_month(buffer);
    const unsigned int numeric_day = get_mday(buffer);
    return days_since_epoch_from_triple(numeric_year, numeric_month, numeric_day);
}

void date_string_from_days_from_epoch(DaysFromEpoch days_from_epoch, DateString* date_string) {
    const unsigned int year = days_since_epoch_get_year(days_from_epoch);
    const unsigned int month = days_since_epoch_get_month(days_from_epoch);
    const unsigned int mday = days_since_epoch_get_mday(days_from_epoch);

    char* buffer = UNWRAP(*date_string);
    small_int_on_two_digits(year / 100u, buffer);
    small_int_on_two_digits(year % 100u, buffer + 2);
    small_int_on_two_digits(month, buffer + 5);
    small_int_on_two_digits(mday, buffer + 8);

    buffer[4] = '-';
    buffer[7] = '-';
    buffer[10] = '\0';
}

void date_string_initialize_from_buffer(const char* buffer, DateString* date_string) {
    char* sink = UNWRAP(*date_string);
    assert(string_length(buffer) == 10, "`date_string_initialize_from_buffer` buffer argument has not size 10");
    for(unsigned int size = 10; size--;)
        sink[size] = buffer[size];
    sink[10] = '\0';
}

const char* date_string_open_buffer(const DateString* date_string) {
    return UNWRAP(*date_string);
}
