#ifndef __APP_JS_LIBRARY__
#define __APP_JS_LIBRARY__

extern int app_read_from_socket(const char* writePtr, const int maxBytesToWrite);

extern int app_write_to_socket(const char* readPtr);

#endif