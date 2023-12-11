call D:\projects\emsdk\upstream\bin\clang.exe --target=wasm32 ^
    -Os -std=c99 -Wextra -Wall -Werror -pedantic-errors -nostdlib ^
    -Wl,-allow-undefined-file wasm.syms ^
    -Wl,--import-memory ^
    -Wl,--import-memory ^
    -Wl,--export=__heap_base ^
    -Wl,--export=__data_end ^
    -Wl,-z,stack-size=131328 ^
        src/main.c -o dist/app.wasm
move /Y dist\app.wasm ..\frontend\v5\dist\app.wasm