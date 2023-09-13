#include "./ioserver.h"

#include <assert.h>
#include <stdlib.h>
#include <string.h>

#include "./shared/debug.h"
#include "./js_library/js_library.h"


static inline int min(int a, int b) { return a < b ? a : b; }

struct IOServer {
  char* shared_memory_pointer;
  int capacity;
};

static struct IOServer io_server;


int ioserver_reserve_shared_memory(const unsigned int capacity)
{
  char* memory = (char*) malloc(sizeof(char) * capacity);
  if(memory) {
    io_server.shared_memory_pointer = memory;
    io_server.capacity = capacity;
    return 1;
  }
  return 0;
}

int ioserver_write_string(const char* source)
{
  const int bytes_size = strlen(source) + 1;
  if(bytes_size > io_server.capacity) {
    return 0;
  } else {
    char* readPtr = io_server.shared_memory_pointer;
    memcpy(readPtr, source, bytes_size);
    if(app_write_to_socket(readPtr)) {
      return bytes_size;
    } else {
      return 0;
    }
  }
}

int ioserver_read_string(char* target, const int capacity)
{
    char* writePtr = io_server.shared_memory_pointer;
    const int maxBytesToWrite = min(io_server.capacity, capacity);

    const int numberOfWrittenBytes = app_read_from_socket(writePtr, maxBytesToWrite);
    LOG_IF(numberOfWrittenBytes >= capacity,
        "Read %d bytes, but can only handle %d"
        ,numberOfWrittenBytes
        ,capacity
    )
    if(numberOfWrittenBytes) {
        memcpy(target, writePtr, numberOfWrittenBytes);
        LOG(
            "Read following line from socket:"
            "\n\t%s"
            "\n\t%d (%d)"
            ,target
            ,(int)strlen(target)
            ,numberOfWrittenBytes
        ) LOG_FLUSH
        return numberOfWrittenBytes;
    } else {
        assert(capacity > 0);
        target[0] = '\0';
        return 0;
    }
}
