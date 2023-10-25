typedef __SIZE_TYPE__ size_t;

void* memset(void* any, int value, size_t s) {
    register unsigned char _value = (unsigned char) value;
    unsigned char* _ptr = (unsigned char*) any;
    if(s) do {
        *(_ptr++) = _value;
    } while(--s);

    return any;
}
