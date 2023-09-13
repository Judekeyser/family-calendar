#include "./request.h"

#include <string.h>

#include "./shared/debug.h"
#include "./shared/string_startsWith.h"
#include "./route_calendar/route_calendar.h"

#include "./ioserver.h"


typedef int(*route_handler)(const char* url_segments, const char* query_parameters);

typedef int(*route_guard)(const char* url_segments);
typedef int(*route_handle_query_parameter)(const char* key, const char* value);
typedef void(*route_terminate)(void);

struct RouteHandler {
    route_guard guard;
    route_handle_query_parameter handle_query_parameter;
    route_terminate terminate;
};

const struct RouteHandler route_handlers[] = {
    {
        .guard = route_calendar_guard,
        .handle_query_parameter = route_calendar_handle_query_parameter,
        .terminate = route_calendar_terminate
    },
    {
        .guard = NULL
    }
};


static void fragment_url(const char* source_url, char* url_segments, const int size)
{
    const int source_size = strlen(source_url);
    if(source_size < size - 1) {
        int i;
        for(i = 0; i < source_size; i++) {
            const char letter = source_url[i];
            url_segments[i] = letter == '/' ? '\0' : letter;
        }
        for(;i < size; i++) {
            url_segments[i] = '\0';
        }
    }
}

static void find_handler(const char* url_segments, const struct RouteHandler** resolved_handler)
{
    *resolved_handler = NULL;
    for(
        const struct RouteHandler* cursor = route_handlers;
        cursor -> guard;
        cursor += 1
    ) {
        if(cursor -> guard(url_segments)) {
            *resolved_handler = cursor;
            break;
        }
    }
}


int request_accept(void)
{
#   ifdef MEM_SIZE
#     error Unable to define local macro MEM_SIZE
#   else
#     define MEM_SIZE 128
    static char working_memory[MEM_SIZE];

    /**
     * STEP 1:
     * -------
     * Call to JavaScript to acquire the preamble line.
     * Dispatch the preamble line on to decide which handler to choose.
     */
    ioserver_read_string(working_memory, MEM_SIZE);

    const struct RouteHandler* current_route_handler = NULL;
    if(string_startsWith("GET ", working_memory)) {
        fragment_url(working_memory + 4, working_memory, MEM_SIZE);
        find_handler(working_memory, &current_route_handler);

        if(current_route_handler) {
            /**
            * STEP 2:
            * -------
            * Fetch the input stream until no information available.
            * For every line, we must replace the first = sign by NUL,
            * so that we can then extract key/value pairs.
            */
            for(int N = 100;--N;) {
                ioserver_read_string(working_memory, MEM_SIZE);
                if(strlen(working_memory)) {
                    {
                        char* equalSign = strchr(working_memory, ':');
                        assert(equalSign);
                        *equalSign = '\0';
                    }
                    const char* key = working_memory;
                    const char* value = working_memory + strlen(working_memory) + 1;

                    LOG(
                        "Query parameter:"
                        "\n\tKey: %s"
                        "\n\tValue: %s"
                        ,key
                        ,value
                    ) LOG_FLUSH

                    current_route_handler -> handle_query_parameter(key, value);
                } else {
                    LOG("%s","End of streaming");

                    /**
                     * STEP 3:
                     * -------
                     * Terminate the process
                     */
                    current_route_handler -> terminate();
                    ioserver_write_string("RESPONSE: OK");
                    
                    /**
                     * Notify success and escape
                     */
                    return 1;
                }
            }
            LOG("%s", "Max iteration reached") LOG_FLUSH
        } else {
            LOG(
                "Unable to find route handler"
                "\n\tWorking memory status: %s"
                ,working_memory
            ) LOG_FLUSH
        }
    }

    return 0;
#     undef MEM_SIZE
#   endif
}
