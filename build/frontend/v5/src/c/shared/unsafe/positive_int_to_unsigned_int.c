#include "./positive_int_to_unsigned_int.h"

#include "../assert.h"


unsigned int positive_int_to_unsigned_int(const int x) {
    assert(x >= 0, "Positive int must be positive");
    return x >= 0 ? ((unsigned int) x) : 0u;
}
