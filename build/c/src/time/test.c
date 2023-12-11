void date_test_main(void)
{
test("normalizedDate: Correct number of days to 2001-01-01", {
    String input = string_literal("2001-01-01");
    DaysFromEpoch date = date_from_string(&input);
    error = 0u == date.value ? SUCCESS : ASSERTION_ERROR;
});
test("normalizedDate: Correct number of days to 2019-03-17", {
    String input = string_literal("2019-03-17");
    DaysFromEpoch date = date_from_string(&input);
    error = 6649u == date.value ? SUCCESS : ASSERTION_ERROR;
});
test("normalizedDate: Correct number of days to 2020-03-17", {
    String input = string_literal("2020-03-17");
    DaysFromEpoch date = date_from_string(&input);
    error = 7015u == date.value ? SUCCESS : ASSERTION_ERROR;
});
test("normalizedDate: Correct number of days to 2023-12-31", {
    String input = string_literal("2023-12-31");
    DaysFromEpoch date = date_from_string(&input);
    error = 8399u == date.value ? SUCCESS : ASSERTION_ERROR;
});
test("normalizeDate converts 2022-12-31 one before 2023-01-01", {
    String input = string_literal("2022-12-31");
    DaysFromEpoch date = date_from_string(&input);

    String temoin = string_literal("2023-01-01");
    DaysFromEpoch temoin_date = date_from_string(&temoin);

    error = (temoin_date.value-1u) == date.value ? SUCCESS : ASSERTION_ERROR;
});
test("Date 2023-31-12 is parsed correctly", {
    String input = string_literal("2023-12-31");
    DaysFromEpoch date = date_from_string(&input);
    error = date.value == 8399u ? SUCCESS : ASSERTION_ERROR;
});
test("Spreading the date explains 2023-31-12 correctly", {
    DaysFromEpoch date = { 8399u };
    Date explained = date_explain(&date);

    error = (
            explained.month == 12 &&
            explained.year == 2023 &&
            explained.day == 31
        ) ? SUCCESS : ASSERTION_ERROR;
});
}
