#ifndef APP_SHARED_BUFFER_COPY
#define APP_SHARED_BUFFER_COPY

/**
 * Copy blocks of memory, à la `strcpy`
 */
void buffer_copy(char* target, const char* source, unsigned int size);

#endif
