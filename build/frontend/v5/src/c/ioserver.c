#include "./ioserver.h"

#include "./shared/assert.h"
#include "./shared/string_length.h"
#include "./shared/string_copy.h"
#include "./js_library/js_library.h"


struct IOServerSessionStruct {
  unsigned int size;
};

struct IOServer {
  char* shared_memory_pointer;
  unsigned int capacity;
  struct IOServerSessionStruct session;
};

static struct IOServer io_server;


/**
 * Sets the information about shared memory for input buffer
 */
void ioserver_set_shared_memory(char* start, const unsigned int capacity) {
  io_server.shared_memory_pointer = start;
  io_server.capacity = capacity;
}


/**
 * Returns an error code if reading failed.
 * In case the string to read is too long, it is an error.
 */
int ioserver_read_string(char* target, const unsigned int capacity) {
    char* writePtr = io_server.shared_memory_pointer;

    const unsigned int numberOfWrittenBytes = app_read_from_socket(
      writePtr,
      io_server.capacity < capacity ? io_server.capacity : capacity
    );

    if(numberOfWrittenBytes) {
      assert(string_length(writePtr)+1 == numberOfWrittenBytes, "ioserver_read_string length of input string does not match number of bytes count");
      string_copy(target, writePtr);
      return 0;
    } else {
      assert(capacity > 0, "ioserver_read_string Capacity cannot be 0");
      target[0] = '\0';
      return 1;
    }
}


/**
 * Opens a session for passing strings to JS
 */
void ioserver_open(void) {
  io_server.session.size = 0;
  io_server.shared_memory_pointer[0] = '\0';
}


/**
 * Commits a session for passing strings to JS.
 * Returns an error code.
 */
int ioserver_commit(void) {
  assert(string_length(io_server.shared_memory_pointer) == io_server.session.size, "ioserver_commit session size got unsync with memory length");
  assert(string_length(io_server.shared_memory_pointer) < io_server.capacity, "ioserver_commt memory length goes beyond capacity (cannot be because NUL byte)");
  return app_write_to_socket(io_server.shared_memory_pointer) ? 0 : 1;
}


/**
 * Stacks a string in the buffer. The previous NUL
 * character is replaced by the first character of the string,
 * and a new NUL character takes place at the end.
 *
 * Returns an error code.
 */
int ioserver_stack_string(const char* string) {
  if(string) {
    assert(io_server.capacity > io_server.session.size, "ioserver_stack_string session size goes beyond capacity before stacking (cannot be because NUL byte)");
    const unsigned int string_size = string_length(string);
    if(io_server.capacity > string_size + io_server.session.size + 1) {
      string_copy(io_server.shared_memory_pointer + io_server.session.size, string);
      io_server.session.size += string_size;
      assert(io_server.capacity > io_server.session.size, "ioserver_stack_string session size goes beyond capacity after stacking (cannot be because NUL byte)");
      assert(string_length(io_server.shared_memory_pointer) == io_server.session.size, "ioserver_stack_string memory length should be the same as session size, but it's not");
    } else {
      return -1;
    }
  }
  return 0;
}
