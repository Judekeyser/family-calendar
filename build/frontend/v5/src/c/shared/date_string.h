/**
 * Date String Interface
 * ---------------------
 *
 * The aim of this header is to provide an interface to interpret a string
 * that is supposed to represent a date, formatted as
 *      YYYY-MM-DD
 * Elements in the string are returned as unsigned int, without error.
 *
 * If the string does not conform to the specified format, the behavior is undefined.
 *
 * The converse operation is also provided. Numbers are truncated if they do not fit the
 * expected format.
 */

#ifndef APP_SHARED_DATE_STRING 
#define APP_SHARED_DATE_STRING


unsigned int date_string_get_year(const char* date_string);

unsigned int date_string_get_month(const char* date_string);

unsigned int date_string_get_mday(const char* date_string);

void date_string_from_triple(
    unsigned int year, unsigned int month, unsigned int day,
    char* buffer
);

#endif
