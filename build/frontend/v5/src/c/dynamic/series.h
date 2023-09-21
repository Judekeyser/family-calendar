#ifndef __APP_DYNAMIC_SERIES__
#define __APP_DYNAMIC_SERIES__

struct SeriesStruct {
    int external_id;
};

typedef struct SeriesStruct* Series;


void series_create(Series* series);

void series_dispose(const Series series);

int series_get_as_int(const Series series, const unsigned int index);

void series_set_int(const Series series, const unsigned int index, const int value);

void series_push_int(const Series series, const int value);

int series_size(const Series series);

#endif