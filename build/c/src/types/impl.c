#include "./api.h"

Error pointer_difference(void *a, void *b, PointerPositiveDifference *difference)
{
    const char *x = a;
    const char *y = b;

    const PointerPositiveDifference _difference = (PointerPositiveDifference)(y - x);
    if(x + _difference != y) {
        return ASSERTION_ERROR;
    } else {
        *difference = _difference;
        return SUCCESS;
    }
}
