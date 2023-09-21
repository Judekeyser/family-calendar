#ifndef __APP_SHARED_DAYS_SINCE_EPOCH__
#define __APP_SHARED_DAYS_SINCE_EPOCH__


struct DaysSinceEpoch {
    unsigned int days;
};

unsigned int dse_get_month(const struct DaysSinceEpoch* date);

unsigned int dse_get_year(const struct DaysSinceEpoch* date);

unsigned int dse_get_mday(const struct DaysSinceEpoch* date);

unsigned int dse_get_wday(const struct DaysSinceEpoch* date);

void dse_set_date(
    const unsigned int year,
    const unsigned int month,
    const unsigned int mday,
    struct DaysSinceEpoch* date);

void dse_add_days(const int days, struct DaysSinceEpoch* date);

#endif