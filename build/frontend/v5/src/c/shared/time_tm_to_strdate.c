#include "./time_tm_to_strdate.h"

#include <time.h>
#include <assert.h>

void flush_decimal_digits(int n, char* target)
{
    static char* table = "0123456789";
    assert(n > 0);
    assert(n < 100);
    const int N = n / 10;
    target[0] = table[N < 10 ? N : 0];
    target[1] = table[n % 10];
}

void time_tm_to_strdate(const struct tm* datetime, char* strdate)
{
    const int numeric_year = datetime -> tm_year + 1900;
    const int numeric_month = datetime -> tm_mon + 1;
    const int numeric_day = datetime -> tm_mday;

    flush_decimal_digits(numeric_year / 100, strdate);
    flush_decimal_digits(numeric_year % 100, strdate);
    flush_decimal_digits(numeric_month, strdate);
    flush_decimal_digits(numeric_day, strdate);
}
