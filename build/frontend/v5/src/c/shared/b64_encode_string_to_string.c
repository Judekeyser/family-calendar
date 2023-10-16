#include "./b64_encode_string_to_string.h"

#include "./assert.h"
#include "./string_length.h"


static const char* const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
static char letter_at(const int value) {
    assert(value <= 63, "Single Base 64 value on 6 bits exceeds 63");
    assert(value >= 0, "Single Base 64 value on 6 bits is actually negative");
    return ALPHABET[value];
}


void b64_encode_string_to_string(const char* source, char* target) {
    assert(sizeof(int) >= 4*sizeof(char), "Unable to perform base 64 conversion in a context where `int` is not wide enough");
    
    const unsigned int size_of_source = string_length(source);
    int stack;

    for(unsigned int i = size_of_source / 3u; i--;) {
        stack  = *(source++) << 16;
        stack |= *(source++) <<  8;
        stack |= *(source++);
        *(target++) = letter_at((stack & (63 << 18)) >> 18);
        *(target++) = letter_at((stack & (63 << 12)) >> 12);
        *(target++) = letter_at((stack & (63 <<  6)) >>  6);
        *(target++) = letter_at((stack & (63 <<  0)) >>  0);
    }

    switch(size_of_source % 3u) {
        case 1:
            stack = (*source) << 4;
            *(target++) = letter_at((stack & (63 <<  6)) >>  6);
            *(target++) = letter_at((stack & (63 <<  0)) >>  0);
            *(target++) = '=';
            *(target++) = '=';
            break;
        case 2:
            stack  = *(source++) << 10;
            stack |= *(source++) <<  2;
            *(target++) = letter_at((stack & (63 << 12)) >> 12);
            *(target++) = letter_at((stack & (63 <<  6)) >>  6);
            *(target++) = letter_at((stack & (63 <<  0)) >>  0);
            *(target++) = '=';
            break;
    }
    *target = '\0';
}
