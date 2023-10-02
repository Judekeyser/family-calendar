#ifndef APP_JS_LIBRARY
#define APP_JS_LIBRARY

/** Assertion */

extern void app_throw_error(const char* errorMessage);

extern void app_log(const char* logMessage);

/** IO Socket */

extern unsigned int app_read_from_socket(const char* writePtr, const unsigned int maxBytesToWrite);

extern unsigned int app_write_to_socket(const char* readPtr);

/** SERIES */

extern int app_series_create(void);

extern int app_series_zeros(const unsigned int size);

extern int app_series_blanks(const unsigned int size);

extern int app_series_get_as_int(const int seriesPtr, const unsigned int index);

extern int app_series_get_as_string(const int seriesPtr, const unsigned int index, char* target, const unsigned int capacity);

extern void app_series_set_int(const int seriesPtr, const unsigned int index, const int value);

extern void app_series_set_string(const int seriesPtr, const unsigned int index, const char* source);

extern void app_series_push_int(const int seriesPtr, const int value);

extern void app_series_push_string(const int seriesPtr, const char* source);

extern unsigned int app_series_size(const int seriesPtr);

/** DATAFRAMES */

extern int app_dataframe_create_empty(void);

extern int app_dataframe_append_column(const int dfPtr, const char* columnName, const int seriesPtr);

extern int app_get_column_at_index(const int dfPtr, const unsigned int column_index);

extern int app_select_with_isin(const int dfPtr, const unsigned int column_index, const int seriesPtr);

extern int app_dataframe_reindex(const int dfPtr, const unsigned int column_index);

#endif
