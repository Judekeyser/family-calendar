#ifndef APP_ASSERT
#define APP_ASSERT

#  ifdef NDEBUG
#    define assert(predicate,...) ;
#    define log(simple_message) ;
#  else
#    include "../js_library/js_library.h"
#    define assert(predicate,...) if(!(predicate)) app_throw_error(__VA_ARGS__);
#    define log(message) app_log(message);
#  endif

#define WRAP(x) {._1 = (x)}
#define UNWRAP(x) (x)._1

#define UNUSED(x) {if(0) (void)(x); }

#endif
