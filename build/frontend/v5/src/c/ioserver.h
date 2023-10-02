#ifndef APP_IOSERVER
#define APP_IOSERVER


/**
 * Sets the information about shared memory for input buffer
 */
void ioserver_set_shared_memory(char* start, const unsigned int capacity);


/**
 * Returns an error code if reading failed.
 * In case the string to read is too long, it is an error.
 */
int ioserver_read_string(char* target, const unsigned int capacity);


/**
 * Opens a session for passing strings to JS
 */
void ioserver_open(void);


/**
 * Commits a session for passing strings to JS.
 * Returns an error code.
 */
int ioserver_commit(void);


/**
 * Stacks a string in the buffer. The previous NUL
 * character is replaced by the first character of the string,
 * and a new NUL character takes place at the end.
 *
 * Returns an error code.
 */
int ioserver_stack_string(const char* string);

#endif
