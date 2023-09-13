#include <emscripten.h>
#include "./ioserver.h"
#include "./request.h"

#include "./shared/debug.h"

int main(void)
{
  LOG(
    "%s", "Launching WASM module."
  )
  const int success = ioserver_reserve_shared_memory(1024);
  LOG_IF(!success,
    "%s", "\n\tFailed to allocate shared memory for IO"
  )
  LOG_IF(success,
    "%s", "\n\tSuccessfully allocated 1024 bytes on HEAP"
  )
  LOG_FLUSH
  return success;
}

int accept(void)
{
  return request_accept();
}
