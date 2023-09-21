//#include <emscripten.h>
//#include <stdlib.h>

#include "./ioserver.h"
#include "./request.h"

#include "./dynamic/series.h"


__attribute__((visibility("default"))) int accept(char* start, const unsigned int capacity)
{
  struct SeriesStruct _series;
  Series series = &_series;

  series_create(&series);
  if(series) {
    for(int i = 0;i < 1000000; i++)
      series_push_int(series, i);
  }

  ioserver_set_shared_memory(start, capacity);
  return request_accept();
}
