#include "./small_int_on_two_digits.h"

#include "./assert.h"
#include "./small_int_on_one_digit.h"


void small_int_on_two_digits(const unsigned int small_int, char* buffer) {
    assert(small_int >= 0, "flush_decimal_digits small_int must be > 0");
    assert(small_int < 100, "flush_decimal_digits small_int must be < 100");

    small_int_on_one_digit(small_int / 10, buffer);
    small_int_on_one_digit(small_int % 10, buffer + 1);
}
