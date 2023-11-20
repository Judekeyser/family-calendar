static inline char __buffers_b64_letter_at(const Int stack, const Int shift) {
    static const char ALPHABET[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    static const Int MASK6 = (1 << 6) - 1;
    return ALPHABET[(stack & (MASK6 << shift)) >> shift];
}

static inline Int __buffers_b64_byte_slice_ofint(Int x, int slice_number /* 0,1,2 */) {
    static const Int MASK8 = (1 << 8) - 1;
    static const Int DISPLACEMENTS[] = {0, 8, 16};
    return MASK8 & (x >> DISPLACEMENTS[slice_number % 3]);
}

static inline unsigned char __buffers_base64_number_of(const char letter) {
    int prom = (int) letter;
    switch(prom) {
        case 'A': case 'B': case 'C': case 'D': case 'E':
        case 'F': case 'G': case 'H': case 'I': case 'J':
        case 'K': case 'L': case 'M': case 'N': case 'O':
        case 'P': case 'Q': case 'R': case 'S': case 'T':
        case 'U': case 'V': case 'W': case 'X': case 'Y': case 'Z':
            return prom - 'A';
        case 'a': case 'b': case 'c': case 'd': case 'e':
        case 'f': case 'g': case 'h': case 'i': case 'j':
        case 'k': case 'l': case 'm': case 'n': case 'o':
        case 'p': case 'q': case 'r': case 's': case 't':
        case 'u': case 'v': case 'w': case 'x': case 'y': case 'z':
            return (prom - 'a') + 26;
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
            return prom - '0' + 26 + 26;
        case '+':
            return 62;
        default:
            return 63;
    }
}


Int b64_encode(char* target, const char* source, Int size_of_source) {
    Int stack;
    Int size;
    const Int size3 = size_of_source / 3;

    for(Int i = size3; i--;) {
        stack  = *(source++) << 16;
        stack |= *(source++) <<  8;
        stack |= *(source++);
        *(target++) = __buffers_b64_letter_at(stack, 18);
        *(target++) = __buffers_b64_letter_at(stack, 12);
        *(target++) = __buffers_b64_letter_at(stack,  6);
        *(target++) = __buffers_b64_letter_at(stack,  0);
    }
    size = 4*size3;

    switch(size_of_source % 3) {
        case 1:
            stack = (*source) << 4;
            *(target++) = __buffers_b64_letter_at(stack, 6);
            *(target++) = __buffers_b64_letter_at(stack, 0);
            *(target++) = '=';
            *(target++) = '=';
            size += 4;
            break;
        case 2:
            stack  = *(source++) << 10;
            stack |= *(source++) <<  2;
            *(target++) = __buffers_b64_letter_at(stack, 12);
            *(target++) = __buffers_b64_letter_at(stack,  6);
            *(target++) = __buffers_b64_letter_at(stack,  0);
            *(target++) = '=';
            size += 4;
            break;
    }
    
    return size;
}


Int b64_decode(char* target, const char* source, Int size_of_source) {

    Int stack;
    Int size;
    const Int size4 = size_of_source / 4;

    for(Int i = size4 - 1; i--;) {
        stack  = __buffers_base64_number_of(*(source++)) << 18;
        stack |= __buffers_base64_number_of(*(source++)) << 12;
        stack |= __buffers_base64_number_of(*(source++)) <<  6;
        stack |= __buffers_base64_number_of(*(source++)) <<  0;
        *(target++) = __buffers_b64_byte_slice_ofint(stack, 2);
        *(target++) = __buffers_b64_byte_slice_ofint(stack, 1);
        *(target++) = __buffers_b64_byte_slice_ofint(stack, 0);
    }
    size = 3*(size4 - 1);
    
    if(source[3] == '=') {
        if(source[2] == '=') {
            stack  = __buffers_base64_number_of(*(source++)) << 6;
            stack |= __buffers_base64_number_of(*(source++)) << 0;
            stack = stack >> 4;
            *(target++) = stack;
            size += 1;
        } else {
            stack  = __buffers_base64_number_of(*(source++)) << 12;
            stack |= __buffers_base64_number_of(*(source++)) <<  6;
            stack |= __buffers_base64_number_of(*(source++)) <<  0;
            stack = stack >> 2;
            *(target++) = __buffers_b64_byte_slice_ofint(stack, 1);
            *(target++) = __buffers_b64_byte_slice_ofint(stack, 0);
            size += 2;
        }
    } else {
        stack  = __buffers_base64_number_of(*(source++)) << 18;
        stack |= __buffers_base64_number_of(*(source++)) << 12;
        stack |= __buffers_base64_number_of(*(source++)) <<  6;
        stack |= __buffers_base64_number_of(*(source++)) <<  0;
        *(target++) = __buffers_b64_byte_slice_ofint(stack, 2);
        *(target++) = __buffers_b64_byte_slice_ofint(stack, 1);
        *(target++) = __buffers_b64_byte_slice_ofint(stack, 0);
        size += 3;
    }
    
    return size;
}

Int to_natural(const char* buffer, const Int capacity) {
    Int natural = 0;
    for(Int i = 0; i < capacity; i++) {
        char c = buffer[i];
        natural *= 10;
        natural += c <= '9' && c >= '0' ? (c - '0') : 0;
    }
    return natural;
}

Int print_number(Int x, char* buffer, const Int capacity) {
    Int size;
    for(size = 0; size < capacity; size++) {
        buffer[size] = '0' + (x % 10);
        x /= 10;
        if(!x) {
            size += 1;
            break;
        }
    }
    for(Int i = 0; i < size/2; i++) {
        char c = buffer[i];
        buffer[i] = buffer[size - i - 1];
        buffer[size - i - 1] = c;
    }
    return size;
}
