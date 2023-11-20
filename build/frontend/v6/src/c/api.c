#include "./main.h"

/**
 * Those are set by CLang.
 */
extern unsigned char __heap_base[];


__attribute__((visibility("default"))) int accept(void)
{
  unsigned char* _base_ptr = __heap_base; ((void)_base_ptr);
  ((void) _base_ptr);

  return main_accept();
}
