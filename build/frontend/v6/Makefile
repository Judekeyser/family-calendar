wasm:
	docker run --rm -v ${PWD}:/home -u $(id -u):$(id -g) silkeh/clang \
		clang -g \
		-Wextra -Os -Wall -Werror -pedantic-errors -std=c99  -nostdlib \
		--target=wasm32 -fvisibility=hidden \
		-flto \
		-Wl,-allow-undefined-file home/src/c/extern_lib/wasm.syms \
		-Wl,--no-entry \
		-Wl,--strip-all \
		-Wl,--export-dynamic \
		-Wl,--import-memory \
		-Wl,--lto-O3 \
		-Wl,--export=__heap_base \
		-Wl,--export=__data_end \
		-Wl,-z,stack-size=131328 \
		home/src/c/api.c \
			home/src/c/extern_lib/memset.c \
		-o home/dist/app-module.wasm

js:
	npx webpack --config build_utils/webpack/webpack.config.js


run:
	npx webpack serve --open --config build_utils/webpack/webpack.config.js