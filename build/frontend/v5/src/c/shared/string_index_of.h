#ifndef __APP_SHARED_STRING_INDEX_OF__
#define __APP_SHARED_STRING_INDEX_OF__

/**
 * Returns a pointer to the substring of passed string, that starts with
 * the provided charcater. NULL is returned if no such substring exists.
 */
const char* string_index_of(const char* string, const char match);

#endif