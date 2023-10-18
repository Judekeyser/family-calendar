#ifndef APP_DYNAMIC_DATAFRAME
#define APP_DYNAMIC_DATAFRAME

#define     STRDATE_COLUMN_INDEX 0
#define     STRTIME_COLUMN_INDEX 1
#define      UNREAD_COLUMN_INDEX 2
#define    ISDAYOFF_COLUMN_INDEX 3
#define DESCRIPTION_COLUMN_INDEX 4
#define      DETAIL_COLUMN_INDEX 5


#include "./__resource.h"
struct Dataframe {
    struct ResourceStruct resource;
};
typedef struct Dataframe Dataframe;


int dataframe_create_empty(Dataframe* dataframe);

#define dataframe_append_column(self,cname,S) dataframe_append_column_series(self,cname, series_as_column(S))
unsigned int dataframe_append_column_series(
    const Dataframe* self,
    const char* column_name,
    const struct ResourceStruct series_resource
);

int dataframe_get_resource_column_at_index(const Dataframe* dataframe, const unsigned int column_index, struct ResourceStruct* target);

#define dataframe_select_isin(self,cidx,S,...) dataframe_select_isin_resource(self,cidx, series_as_column(S),__VA_ARGS__)
int dataframe_select_isin_resource(const Dataframe* dataframe, const unsigned int column_index, const struct ResourceStruct filter, Dataframe* target);

int dataframe_reindex(const Dataframe* dataframe, const unsigned int column_index, Dataframe* target);

#endif
