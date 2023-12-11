#ifndef STD
#define STD


/** Memory concerns */

#ifdef __SIZE_TYPE__
typedef __SIZE_TYPE__ size_t;
#else
#error "`size_t` cannot be defined. Find a way to recover"
#endif

void* memcpy(void *restrict dest, const void *restrict src, size_t count);

void* memset(void *restrict dest, const int ch, size_t count);


/** Error code definitions */

typedef enum {
    SUCCESS=0,
    ASSERTION_ERROR=1,
    INPUT_ERROR=2
} Error;

/** Common C syntactic enhancers */

#define NUL 0
#define NULL 0

#define array_size(arr) (sizeof(arr)/sizeof(*(arr)))

/** Limits */

#define MAX_BYTE 256u

/** Bounded loops utility */

#define loop(max) for(unsigned long long int N##__LINE__ = (max); N##__LINE__--;)

/** Math utilities -- Warning macros! */

#define MIN(a,b) ((a) < (b) ? (a) : (b))
#define MAX(a,b) ((a) < (b) ? (b) : (a))

#endif

/**

    {
const wasmMemory = new WebAssembly.Memory({'initial': 5});
const memoryBuffer = new Uint8Array(wasmMemory.buffer);

const request = await fetch('app.wasm', { headers: {
    "Accept": "application/wasm"
}});
const wasmProgram = await WebAssembly.instantiateStreaming(request, {
    env: {
        memory: wasmMemory,
        js_debug: function(pointer,size) {
            const slice = memoryBuffer.slice(pointer, pointer+size);
            const string = new TextDecoder().decode(slice);
            console.warn(memoryBuffer, pointer,size, string);
        }
    }
});

const start = wasmProgram.instance.exports._start;

start();
    }


*/

