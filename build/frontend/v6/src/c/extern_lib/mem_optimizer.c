typedef __SIZE_TYPE__ size_t;

void* memset(void* any, int value, size_t s) {
    register unsigned char _value = (unsigned char) value;
    unsigned char* _ptr = (unsigned char*) any;
    if(s) do {
        *(_ptr++) = _value;
    } while(--s);

    return any;
}

void* memcpy (void * destination, const void* source, size_t s) {
    const unsigned char* _source = source;
    unsigned char* _destination = destination;

    for(size_t i = 0; i < s; i++) {
        _destination[i] = _source[i];
    }

    return destination;
}
