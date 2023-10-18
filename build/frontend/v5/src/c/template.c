#include "./template.h"

#include "./js_library/js_library.h"


int template_emit(const char* raw_string) {
    /*
    Previous implementation went through the IOServer:

    -----------------------------------------------------
    ioserver_open();
    return (
        ioserver_stack_string(raw_string)
    ) || ioserver_commit();
    -----------------------------------------------------

    Conceptually this is fine, but it's a bit sad because essentially,
    the JS engine is capable of handling *any* string, not just the ones
    referred to in the shared buffer.

    Therefore, the extra copy is not required at all.
    We try an alternative implementation where we directly share a string.

    The output buffer can thus be made *much smaller*, since only input requests
    are now expected to come in. There won't be any output anymore, as the 
    WASM engine will expose its own memory to JavaScript.

    It will remain the tackle the question of "infinite" streams in-out
    (typically, handling a potentially infinite text from user and flushing it
    on the fly in Base64). This feels clearly out of scope and in practice:
        - we shouldn't allow infinite streams anyway
        - WASM pages are big enough
        - the backend has a de facto upper bound anyway
    so... I think we'll never have to care.
    */
    return app_write_to_socket(raw_string) ? 0 : 1;
}
