#include "./days_since_epoch.h"

#include "./assert.h"


static const unsigned int MONTH_DAYS_CUMUL[49] = {0,
      31,   59,   90,  120,  151,  181,  212,  243,  273,  304,  334,  365,
     396,  424,  455,  485,  516,  546,  577,  608,  638,  669,  699,  730,
     761,  789,  820,  850,  881,  911,  942,  973, 1003, 1034, 1064, 1095,
    1126, 1155, 1186, 1216, 1247, 1277, 1308, 1338, 1369, 1399, 1430, 1461
};

static const unsigned int REF_YEAR = 2001; // 01/01/2001 was a Monday! :party:
static const unsigned int NUMBER_OF_CYCLES = 20; // We do not go beyond 20 cycles of 4 years
static const unsigned int DAYS_IN_CYCLE = 365*3 + 366;


/**
 * We can easily infer what cycle contains the date, starting the count at 0.
 */
static inline unsigned int __get_cycle_of(days_since_epoch_T days_since_epoch) {
    return days_since_epoch / DAYS_IN_CYCLE;
}


/**
 * Knowing the day from the cycle start, is therefore easy to compute
 * and can be used to simplify some computations.
 */
static inline unsigned int __get_cycle_day(days_since_epoch_T days_since_epoch) {
    return days_since_epoch % DAYS_IN_CYCLE;
}


inline static unsigned int __truncate(const unsigned int x) {
    static const unsigned int UPPER_BOUND = DAYS_IN_CYCLE * NUMBER_OF_CYCLES;
    return x > UPPER_BOUND ? UPPER_BOUND : x;
}


unsigned int days_since_epoch_get_mday(DaysFromEpoch self) {
    days_since_epoch_T days_since_epoch = UNWRAP(self);
    unsigned int cday = __get_cycle_day(days_since_epoch);
    assert(cday < MONTH_DAYS_CUMUL[48], "`days_since_epoch_get_mday` cday too long: year too big?");
    for(unsigned int i = 1; i < 49; i++) {
        if(cday < MONTH_DAYS_CUMUL[i]) {
            assert(i < 49, "`days_since_epoch_get_mday` counter variable got out of bound");
            assert(MONTH_DAYS_CUMUL[i-1] <= cday, "`days_since_epoch_get_mday` cday jumped a step");
            return cday - MONTH_DAYS_CUMUL[i-1] + 1u;
        }
    }
    assert(0, "`days_since_epoch_get_mday` Unreachable code reached. Loop never ended correctly");
    return 1;
}

unsigned int days_since_epoch_get_wday(DaysFromEpoch self) {
    days_since_epoch_T days_since_epoch = UNWRAP(self);
    return days_since_epoch % 7u;
}

unsigned int days_since_epoch_get_month(DaysFromEpoch self) {
    days_since_epoch_T days_since_epoch = UNWRAP(self);
    unsigned int cday = __get_cycle_day(days_since_epoch);
    assert(cday < MONTH_DAYS_CUMUL[48], "`__` cday too long. year too big?");
    for(unsigned int i = 1; i < 49; i++) {
        if(cday < MONTH_DAYS_CUMUL[i]) {
            return (i-1) % 12 + 1;
        }
    }
    assert(0, "`days_since_epoch_get_month` Unreachable code reached. Loop never ended correctly");
    return 1;
}

unsigned int days_since_epoch_get_year(DaysFromEpoch self) {
    days_since_epoch_T days_since_epoch = UNWRAP(self);
    unsigned int year = REF_YEAR + __get_cycle_of(days_since_epoch) * 4u;
    switch(__get_cycle_day(days_since_epoch) / 365u) {
        case 4:
        case 3: year += 1;
        case 2: year += 1;
        case 1: year += 1;
        case 0: break;
        default:
            assert(0, "`days_since_epoch_get_year` encountered default case: year too big?");
    }
    return year;
}

DaysFromEpoch days_since_epoch_from_triple(
    unsigned int year, unsigned int month, unsigned int mday
) {
    assert(year < REF_YEAR+NUMBER_OF_CYCLES*4 && year >= REF_YEAR,
        "`days_since_epoch_from_triple` Year is not between 2100 and 2001."
    );
    if(year >= REF_YEAR+NUMBER_OF_CYCLES*4) {
        DaysFromEpoch result = WRAP(REF_YEAR + NUMBER_OF_CYCLES*4 - 1u);
        return result;
    } else if(year < REF_YEAR) {
        DaysFromEpoch result = WRAP(REF_YEAR);
        return result;
    } else {
        const unsigned int y = year - REF_YEAR;
        const unsigned int number_of_cycles = y / 4u;

        const unsigned int extra_days = MONTH_DAYS_CUMUL[
            (month - 1u) + 12u * (y % 4u)
        ] + (mday - 1u);

        const unsigned int days = __truncate(
            number_of_cycles * DAYS_IN_CYCLE + extra_days
        );

        DaysFromEpoch result = WRAP(days);
        assert(days_since_epoch_get_mday(result) == mday, "`days_since_epoch_get_mday` mday does not match");
        assert(days_since_epoch_get_month(result) == month, "`days_since_epoch_get_month` month does not match");
        assert(days_since_epoch_get_year(result) == year, "`days_since_epoch_get_year` year does not match");
        return result;
    }
}

DaysFromEpoch days_since_epoch_add_days(DaysFromEpoch self, int days_to_add) {
    days_since_epoch_T days_since_epoch = UNWRAP(self);
    if(days_to_add < 0) {
        if(days_to_add < -100) {
            return days_since_epoch_add_days(
                days_since_epoch_add_days(self, -100),
                days_to_add + 100
            );
        } else {
            unsigned int positive_days_to_remove = (unsigned int) (-days_to_add);
            if(days_since_epoch < positive_days_to_remove) {
                DaysFromEpoch result = WRAP(0u);
                return result;
            } else {
                DaysFromEpoch result = WRAP(days_since_epoch - positive_days_to_remove);
                return result;
            }
        }
    } else {
        days_since_epoch_T addition_result = days_since_epoch + ((unsigned int) days_to_add);
        if(addition_result < days_since_epoch) {
            DaysFromEpoch result = WRAP(DAYS_IN_CYCLE * NUMBER_OF_CYCLES);
            return result;
        } else {
            DaysFromEpoch result = WRAP(__truncate(addition_result));
            return result;
        }
    }
}

unsigned char days_since_epoch_equals(DaysFromEpoch a, DaysFromEpoch b) {
    days_since_epoch_T _a = UNWRAP(a);
    days_since_epoch_T _b = UNWRAP(b);

    return _a == _b ? 1: 0;
}
