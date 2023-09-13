# ifndef __APP_SHARED_DEBUG__
# define __APP_SHARED_DEBUG__
#   include <assert.h>
#   ifdef NDEBUG
#     include <stdio.h>
#     define LOG(format,...) printf(format,__VA_ARGS__);
#     define LOG_FLUSH LOG("%s","\n");
#     define LOG_IF(predicate,format,...) if(predicate) { LOG(format,__VA_ARGS__) }
#     define LOG_ELSE(predicate,format,...) if(!predicate) { LOG(format,__VA_ARGS__) }
#   else
#     define LOG(format,...) ;
#     define LOG_FLUSH ;
#     define LOG_IF(predicate,...) ;
#     define LOG_ELSE(predicate,...) ;
#   endif
# endif