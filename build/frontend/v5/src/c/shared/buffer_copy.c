#include "./buffer_copy.h"


void buffer_copy(char* target, const char* source, unsigned int size) {
    while(size--) {
        target[size] = source[size];
    }
}
