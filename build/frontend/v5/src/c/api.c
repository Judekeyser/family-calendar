#include "./ioserver.h"
#include "./request.h"


__attribute__((visibility("default"))) int accept(char* start, const unsigned int capacity)
{
  ioserver_set_shared_memory(start, capacity);
  return request_accept();
}
