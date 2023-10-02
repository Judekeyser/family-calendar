#ifndef APP_SHARED_UNSAFE_MEMSET
#define APP_SHARED_UNSAFE_MEMSET

#ifdef __SIZE_TYPE__
typedef __SIZE_TYPE__ size_t;
#else
typedef typeof(sizeof(0)) size_t; // I have actually no idea
#endif

void* memset(void* any, int value, size_t s);

#endif
