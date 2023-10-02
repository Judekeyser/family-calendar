#ifndef APP_SHARED_SMALL_INT_FROM_STRING
#define APP_SHARED_SMALL_INT_FROM_STRING

/**
 * Converts a C-string, that represents a non negative number
 * smaller than 10_000, into a integer.
 *
 * Any unrecognised digits are skipped. The behavior of this method on
 * non numeric strings is unspecified.
 */
unsigned int small_int_from_string(const char* string);

#endif
