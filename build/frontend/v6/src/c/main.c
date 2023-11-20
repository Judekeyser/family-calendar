#include "./main.h"

typedef unsigned int Int;
typedef char* Buffer;

extern void app_log(const char* message);
extern void app_get_env(const char* varName, const char* value, const Int valueSize);


void assert(int test, const char* tmpl) {
  if(!test) app_log(tmpl);
}
#include "./lang/buffers.c"
#include "./lang/days_from_epoch.c"


int main_accept(void)
{
  static char MEMORY[1024];
  (void) MEMORY;

  unsigned int S = parseHex('f'); ((void) S);


  return 0;
}
