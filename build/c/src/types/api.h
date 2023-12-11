#ifndef TYPES
#define TYPES

#include "../std/api.h"

typedef unsigned char Number8;
typedef unsigned short Number16;
typedef unsigned int Fast;
typedef unsigned long int Number32;
typedef unsigned long long int Number64;

typedef _Bool Bool;

typedef Number32 PointerPositiveDifference;

Error pointer_difference(void *a, void *b, PointerPositiveDifference *difference);

#endif
