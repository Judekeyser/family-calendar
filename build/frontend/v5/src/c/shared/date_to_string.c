#include "./date_to_string.h"

#include "./assert.h"
#include "./days_since_epoch.h"


static void flush_decimal_digits(int n, char* target)
{
    static const char* table = "0123456789";
    assert(n > 0, "flush_decimal_digits n must be > 0");
    assert(n < 100, "flush_decimal_digits n must be < 100");
    const int N = n / 10;
    target[0] = table[N < 10 ? N : 0];
    target[1] = table[n % 10];
}

void date_to_string(const struct DaysSinceEpoch* date, char* strdate)
{
    const int numeric_year = dse_get_year(date);
    const int numeric_month = dse_get_month(date);
    const int numeric_day = dse_get_mday(date);

    flush_decimal_digits(numeric_year / 100, strdate);
    flush_decimal_digits(numeric_year % 100, strdate);
    flush_decimal_digits(numeric_month, strdate);
    flush_decimal_digits(numeric_day, strdate);
}
