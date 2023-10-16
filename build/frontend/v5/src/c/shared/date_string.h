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


#include "./days_since_epoch.h"
#include "./assert.h"


typedef struct {
    char _1[11];
} DateString;

#define DATE_STRING_SPREAD(var) UNWRAP(var), 11


DaysFromEpoch date_string_to_days_from_epoch(DateString* date_string);

void date_string_initialize_from_buffer(const char* buffer, DateString* date_string);

void date_string_from_days_from_epoch(DaysFromEpoch datetime, DateString* date_string);

const char* date_string_open_buffer(const DateString* date_string);

#endif
