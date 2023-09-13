#ifndef __APP_IOSERVER__
#define __APP_IOSERVER__


int ioserver_reserve_shared_memory(const unsigned int requestedSize);

int ioserver_write_string(const char* source);

int ioserver_read_string(char* target, const int capacity);


#endif