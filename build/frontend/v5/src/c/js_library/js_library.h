#ifndef __APP_JS_LIBRARY__
#define __APP_JS_LIBRARY__

/** Assertion */

extern void app_throw_error(const char* errorMessage);

/** IO Socket */

extern int app_read_from_socket(const char* writePtr, const int maxBytesToWrite);

extern int app_write_to_socket(const char* readPtr);

/** SERIES */

extern int app_series_create(void);

extern void app_series_dispose(const int seriesPtr);

extern int app_series_get_as_int(const int seriesPtr, const unsigned int index);

extern void app_series_set_int(const int seriesPtr, const unsigned int index, const int value);

extern void app_series_push_int(const int seriesPtr, const int value);

extern int app_series_size(const int seriesPtr);

#endif