static const Int DAYS_FROM_EPOCH_MONTH_DAYS_CUMUL[49] = {0,
      31,   59,   90,  120,  151,  181,  212,  243,  273,  304,  334,  365,
     396,  424,  455,  485,  516,  546,  577,  608,  638,  669,  699,  730,
     761,  789,  820,  850,  881,  911,  942,  973, 1003, 1034, 1064, 1095,
    1126, 1155, 1186, 1216, 1247, 1277, 1308, 1338, 1369, 1399, 1430, 1461
};

static const Int DAYS_FROM_EPOCH_REF_YEAR = 2001; // 01/01/2001 was a Monday! :party:
static const Int DAYS_FROM_EPOCH_NUMBER_OF_CYCLES = 20; // We do not go beyond 20 cycles of 4 years
static const Int DAYS_FROM_EPOCH_DAYS_IN_CYCLE = 365*3 + 366;
static const Int DAYS_FROM_EPOCH_UPPER_BOUND = DAYS_FROM_EPOCH_DAYS_IN_CYCLE * DAYS_FROM_EPOCH_NUMBER_OF_CYCLES;


struct DaysFromEpoch {
    Int _1;
};
typedef struct DaysFromEpoch* DaysFromEpoch;


Int days_from_epoch_get_mday(DaysFromEpoch self) {
    Int days_from_epoch = self -> _1;
    Int cday = days_from_epoch % DAYS_FROM_EPOCH_DAYS_IN_CYCLE;
    for(Int i = 1; i < 49; i++) {
        if(cday < DAYS_FROM_EPOCH_MONTH_DAYS_CUMUL[i]) {
            assert(i < 49, "`days_from_epoch_get_mday` counter variable got out of bound");
            assert(DAYS_FROM_EPOCH_MONTH_DAYS_CUMUL[i-1] <= cday, "`days_from_epoch_get_mday` cday jumped a step");
            return cday - DAYS_FROM_EPOCH_MONTH_DAYS_CUMUL[i-1] + 1u;
        }
    }
    assert(0, "`days_from_epoch_get_mday` cday too long: year too big?");
    return 1;
}

Int days_from_epoch_get_wday(DaysFromEpoch self) {
    Int days_from_epoch = self -> _1;
    return days_from_epoch % 7u;
}

Int days_from_epoch_get_month(DaysFromEpoch self) {
    Int days_from_epoch = self -> _1;
    Int cday = days_from_epoch % DAYS_FROM_EPOCH_DAYS_IN_CYCLE;
    assert(cday < DAYS_FROM_EPOCH_MONTH_DAYS_CUMUL[48], "`__` cday too long. year too big?");
    for(Int i = 1; i < 49; i++) {
        if(cday < DAYS_FROM_EPOCH_MONTH_DAYS_CUMUL[i]) {
            return (i-1) % 12 + 1;
        }
    }
    assert(0, "`__` cday too long. year too big?");
    return 1;
}

Int days_from_epoch_get_year(DaysFromEpoch self) {
    Int days_from_epoch = self -> _1;
    Int cycle = days_from_epoch / DAYS_FROM_EPOCH_DAYS_IN_CYCLE;
    Int year = DAYS_FROM_EPOCH_REF_YEAR + cycle * 4u;
    switch((days_from_epoch - cycle*DAYS_FROM_EPOCH_DAYS_IN_CYCLE) / 365u) {
        case 4:
        case 3: year += 1;
        case 2: year += 1;
        case 1: year += 1;
        case 0: break;
        default:
            assert(0, "`days_from_epoch_get_year` encountered default case: year too big?");
    }
    return year;
}

void days_from_epoch_from_triple(
    Int year, Int month, Int mday,
    DaysFromEpoch sink
) {
    assert(year < DAYS_FROM_EPOCH_REF_YEAR+DAYS_FROM_EPOCH_NUMBER_OF_CYCLES*4 && year >= DAYS_FROM_EPOCH_REF_YEAR,
        "`days_from_epoch_from_triple` Year is not between 2100 and 2001."
    );
    if(year >= DAYS_FROM_EPOCH_REF_YEAR+DAYS_FROM_EPOCH_NUMBER_OF_CYCLES*4) {
        struct DaysFromEpoch result = {
            ._1 = DAYS_FROM_EPOCH_REF_YEAR + DAYS_FROM_EPOCH_NUMBER_OF_CYCLES*4 - 1u
        };
        *sink = result;
    } else if(year < DAYS_FROM_EPOCH_REF_YEAR) {
        struct DaysFromEpoch result = {
            ._1 = DAYS_FROM_EPOCH_REF_YEAR
        };
        *sink = result;
    } else {
        const Int y = year - DAYS_FROM_EPOCH_REF_YEAR;
        const Int number_of_cycles = y / 4u;

        const Int extra_days = DAYS_FROM_EPOCH_MONTH_DAYS_CUMUL[
            (month - 1u) + 12u * (y % 4u)
        ] + (mday - 1u);

        Int days = (
            days = number_of_cycles * DAYS_FROM_EPOCH_DAYS_IN_CYCLE + extra_days,
            days > DAYS_FROM_EPOCH_UPPER_BOUND ? DAYS_FROM_EPOCH_UPPER_BOUND : days
        );

        struct DaysFromEpoch result = { ._1 = days };
        assert(days_from_epoch_get_mday(&result) == mday, "`days_from_epoch_get_mday` mday does not match");
        assert(days_from_epoch_get_month(&result) == month, "`days_from_epoch_get_month` month does not match");
        assert(days_from_epoch_get_year(&result) == year, "`days_from_epoch_get_year` year does not match");
        *sink = result;
    }
}

void days_from_epoch_add_days(DaysFromEpoch self, int days_to_add, DaysFromEpoch sink) {
    Int days_from_epoch = self -> _1;
    if(days_to_add < 0) {
        assert(days_to_add >= -100, "Subtracting too many days: truncated to -100");
        days_to_add = days_to_add < -100 ? -100 : days_to_add;

        Int positive_days_to_remove = (Int) (-days_to_add);
        if(days_from_epoch < positive_days_to_remove) {
            struct DaysFromEpoch result = { ._1 = 0u };
            *sink = result;
        } else {
            struct DaysFromEpoch result = { ._1 = days_from_epoch - positive_days_to_remove };
            *sink = result;
        }
    } else {
        Int addition_result = days_from_epoch + ((Int) days_to_add);
        if(addition_result < days_from_epoch) {
            struct DaysFromEpoch result = { ._1 = DAYS_FROM_EPOCH_DAYS_IN_CYCLE * DAYS_FROM_EPOCH_NUMBER_OF_CYCLES };
            *sink = result;
        } else {
            struct DaysFromEpoch result = { ._1 = addition_result > DAYS_FROM_EPOCH_UPPER_BOUND ? DAYS_FROM_EPOCH_UPPER_BOUND : addition_result };
            *sink = result;
        }
    }
}

unsigned char days_from_epoch_equals(DaysFromEpoch a, DaysFromEpoch b) {
    Int _a = a -> _1;
    Int _b = b -> _1;

    return _a == _b ? 1: 0;
}
