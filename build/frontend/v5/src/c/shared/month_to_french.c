#include "./month_to_french.h"


static const char* const JAN = "Janvier";
static const char* const FEB = "Février";
static const char* const MAR = "Mars";
static const char* const AVR = "Avril";
static const char* const MAI = "Mai";
static const char* const JUN = "Juin";
static const char* const JUL = "Juillet";
static const char* const AOT = "Août";
static const char* const SEP = "Septembre";
static const char* const OCT = "Octobre";
static const char* const NOV = "Novembre";
static const char* const DEC = "Décembre";

static const char* const ERROR = "";

static const char* const MONTHS[] = {JAN,FEB,MAR,AVR,MAI,JUN,JUL,AOT,SEP,OCT,NOV,DEC};


const char* month_to_french(const unsigned int month) {
    if(month >= 1 && month <= 12) {
        return MONTHS[month - 1];
    } else {
        return ERROR;
    }
}
