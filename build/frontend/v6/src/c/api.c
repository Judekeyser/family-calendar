#include "./extern_lib/js_library.h"

/**
 * Those are set by CLang. We pass those numbers to JavaScript
 * by using the externed function.
 */
extern unsigned char __heap_base[];


__attribute__((visibility("default"))) int accept(void)
{
  unsigned char* _base_ptr = __heap_base;
  app_set_heap_base(_base_ptr);
  return 0;
}
