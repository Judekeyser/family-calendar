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


typedef struct {
    char _1[11];
} DateString;


unsigned int date_string_get_year(DateString* date_string);

unsigned int date_string_get_month(DateString* date_string);

unsigned int date_string_get_mday(DateString* date_string);

void date_string_from_triple(
    unsigned int year, unsigned int month, unsigned int day,
    DateString* date_string
);

void date_string_initialize_from_buffer(
    DateString* date_string,
    const char* buffer
);

const char* date_string_open_buffer(const DateString* date_string);

#endif
