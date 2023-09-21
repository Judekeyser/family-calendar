#ifndef __APP_ASSERT__
#define __APP_ASSERT__

#  ifdef NDEBUD
#    define assert(predicate,...) ;
#  else
#    include "../js_library/js_library.h"
#    define assert(predicate,...) if(!(predicate)) app_throw_error(__VA_ARGS__);
#  endif

#endif