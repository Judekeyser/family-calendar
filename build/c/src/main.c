#include "std/api.h"
#include "types/api.h"

#ifndef MAINAPP
#define printf(...)
#else
#include <stdio.h>
#define LB "\n"
#define SP "\t"
#endif

/* Main entry point */

static char* address_of_separator(const char *restrict heap, void *const heap_end_excl)
{
    while(heap != heap_end_excl) {
        if(*heap == NUL || *heap == '&') {
            return (char*) heap;
        }
        heap++;
    }
    return NULL;
}

static Error starts_with(
    const void *restrict _heap, const void *const heap_end_excl,
    const void *restrict _expected, const void *const expected_end_excl
) {
    for(
        const char *restrict heap = _heap, *restrict expected = _expected;
        expected != expected_end_excl;
        expected++, heap++
    ) {
        if(heap == heap_end_excl || *expected != *heap) {
            return INPUT_ERROR;
        }
    }
    return SUCCESS;
}

Error _start(void *restrict heap_ptr, void *const heap_end_excl)
{
    char *restrict heap = heap_ptr;

    struct {
        struct {
            char path[10];
        } buffers;
    } input_url;
    (void) input_url;

    {
        PointerPositiveDifference diff;
        {
            const Error error = pointer_difference(heap, heap_end_excl, &diff);
            if(error) {
                return error;
            }
        }
        for(;;) {
            switch(*heap) {
                case '\0': {
                    goto url_finalization;
                } break;
                case 'p': {
                    const char expected[] = "path=";
                    const Error key_error = starts_with(heap, heap_end_excl, expected, expected+(sizeof(expected)-1u));
                    if(key_error) {
                        return key_error;
                    } else {
                        const char *cursor = heap;
                        heap = address_of_separator(heap + (sizeof(expected)-1u), heap_end_excl);

                        *heap = NUL;
                        printf("Got a PATH parameter in URL: %s" LB, cursor);
                    }
                } break;
                default: goto handle_input_error;
            }
        }
    }

    url_finalization: {
        printf("URL parsed fully" LB);
        return SUCCESS;
    }

    handle_input_error: {
        return INPUT_ERROR;
    }
}

#ifdef MAINAPP
int main()
{
    printf("Running program" LB);
    char heap[1024];
    #define set_url(u) memcpy(heap, u, sizeof u)

    set_url("path=foo");

    Error error = _start(heap, heap + sizeof heap);
    if(error) {
        return (int)error;
    }
}
#endif
