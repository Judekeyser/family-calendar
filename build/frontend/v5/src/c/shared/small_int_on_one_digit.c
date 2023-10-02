#include "./small_int_on_one_digit.h"

#include "./assert.h"


void small_int_on_one_digit(const unsigned int small_int, char* buffer) {
    static const char* table = "0123456789";
    assert(small_int >= 0, "small_int_on_one_digit small_int must be > 0");
    assert(small_int < 10, "small_int_on_one_digit small_int must be < 10");
    *buffer = table[small_int % 10];
}
