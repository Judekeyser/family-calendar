/**
 * Days Since Epoch Interface
 * --------------------------
 *
 * The aim of this header is to provide an interface to interpret a triple
 *  (year, month, day)
 * as a number of days since Epoch.
 *
 * The Epoch start time is left unspecified. The result is an unsigned integer.
 * If the provided triple does not correspond to a date, a number is still returned
 * but its specification is unspecified.
 */

#ifndef APP_SHARED_DAYS_SINCE_EPOCH
#define APP_SHARED_DAYS_SINCE_EPOCH

typedef unsigned int days_since_epoch_T;
typedef struct {
    days_since_epoch_T _1;
} DaysFromEpoch;


unsigned int days_since_epoch_get_mday(DaysFromEpoch days_since_epoch);

unsigned int days_since_epoch_get_month(DaysFromEpoch days_since_epoch);

unsigned int days_since_epoch_get_year(DaysFromEpoch days_since_epoch);

unsigned int days_since_epoch_get_wday(DaysFromEpoch days_since_epoch);

DaysFromEpoch days_since_epoch_from_triple(
    unsigned int year, unsigned int month, unsigned int day
);

DaysFromEpoch days_since_epoch_add_days(DaysFromEpoch days_since_epoch, int days_to_add);

unsigned char days_since_epoch_equals(DaysFromEpoch a, DaysFromEpoch b);

#endif
