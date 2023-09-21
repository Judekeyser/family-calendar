#include "./days_since_epoch.h"

#include "./assert.h"


static const unsigned int MONTH_DAYS_CUMUL[49] = {0,
      31,   59,   90,  120,  151,  181,  212,  243,  273,  304,  334,  365,
     396,  424,  455,  485,  516,  546,  577,  608,  638,  669,  699,  730,
     761,  789,  820,  850,  881,  911,  942,  973, 1003, 1034, 1064, 1095,
    1126, 1155, 1186, 1216, 1247, 1277, 1308, 1338, 1369, 1399, 1430, 1461
};

static const unsigned int REF_YEAR = 2001; // 01/01/2001 was a Monday! :party:


/**
 * A Cycle is a group of 4 consecutive years, starting from 2001.
 * A Cycle has the property that the number of days is an invariant.
 */
static const unsigned int DAYS_IN_CYCLE = 365*3 + 366;


/**
 * We can easily infer what cycle contains the date, starting the count at 0.
 */
static unsigned int cycle_of(const struct DaysSinceEpoch* date) {
    return (date -> days) / DAYS_IN_CYCLE;
}


/**
 * Knowing the day from the cycle start, is therefore easy to compute
 * and can be used to simplify some computations.
 */
static inline unsigned int get_cday(const struct DaysSinceEpoch* date) {
    return (date -> days) % DAYS_IN_CYCLE;
}


inline static unsigned int truncate(const unsigned int x) {
    static const unsigned int UPPER_BOUND = DAYS_IN_CYCLE * 20;
    return x > UPPER_BOUND ? UPPER_BOUND : x;
}


unsigned int dse_get_year(const struct DaysSinceEpoch* date) {
    unsigned int year = REF_YEAR + 4 * cycle_of(date);
    switch(get_cday(date) / 365) {
        case 4:
        case 3: year += 1;
        case 2: year += 1;
        case 1: year += 1;
        case 0: break;
        default:
            assert(0, "dse_get_year encountered default case: year too big?");
    }
    return year;
}


unsigned int dse_get_mday(const struct DaysSinceEpoch* date) {
    unsigned int cday = get_cday(date);
    assert(cday < MONTH_DAYS_CUMUL[48], "dse_get_mday cday too long: year too big?");
    for(int i = 1; i < 49; i++) {
        if(cday < MONTH_DAYS_CUMUL[i]) {
            assert(i < 49, "dse_get_mday counter variable got out of bound");
            assert(MONTH_DAYS_CUMUL[i-1] <= cday, "dse_get_mday cday jumped a step");
            return cday - MONTH_DAYS_CUMUL[i-1] + 1;
        }
    }
    assert(0, "dse_get_mday Unreachable code reached. Loop never ended correctly");
    return 1;
}


unsigned int dse_get_month(const struct DaysSinceEpoch* date) {
    unsigned int cday = get_cday(date);
    assert(cday < MONTH_DAYS_CUMUL[48], "dse_get_month cday too long. year too big?");
    for(int i = 1; i < 49; i++) {
        if(cday < MONTH_DAYS_CUMUL[i]) {
            return (i-1) % 12 + 1;
        }
    }
    assert(0, "dse_get_month Unreachable code reached. Loop never ended correctly");
    return 1;
}


inline unsigned int dse_get_wday(const struct DaysSinceEpoch* date) {
    return (date -> days) % 7;
}


void dse_set_date(
    const unsigned int year,
    const unsigned int month,
    const unsigned int mday,
    struct DaysSinceEpoch* date
) {
    assert(year < 2100 && year >= 2001, "dse_set_date Year is not between 2100 and 2001.");
    if(year >= 2100) {
        date -> days = truncate(0);
    } else if(year < 2001) {
        date -> days = truncate(0);
    } else {
        const unsigned int y = year - REF_YEAR;
        const unsigned int number_of_cycles = y / 4;

        const unsigned int extra_days = MONTH_DAYS_CUMUL[
            (month - 1) + 12 * (y % 4)
        ] + (mday - 1);

        date -> days = truncate(
            number_of_cycles * DAYS_IN_CYCLE + extra_days
        );
        assert(dse_get_mday(date) == mday, "dse_set_date mday does not match");
        assert(dse_get_month(date) == month, "dse_set_date month does not match");
        assert(dse_get_year(date) == year, "dse_set_date year does not match");
    }
}


void dse_add_days(const int days, struct DaysSinceEpoch* date) {
    int difference = (int)(date -> days) + days;
    date -> days = truncate((unsigned int) difference);
}
