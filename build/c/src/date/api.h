#ifndef DATE 
#define DATE 

#include "../string/api.h"
#include "../types/api.h"


typedef struct
{
     Short value;
} DaysFromEpoch;

typedef struct
{
    Short year;
    Short month;
    Short day;
} Date;

typedef struct
{
    char data[10];
} DateString;


Optional_Def(DaysFromEpoch);

DaysFromEpoch date_from_string(const String *string);
DaysFromEpoch date_unexplain(const Date *date);
Date date_explain(const DaysFromEpoch *days_from_epoch);

void date_explained_to_string(const Date *date, DateString *date_string);

void date_explained_increment(Date *date);

#endif
