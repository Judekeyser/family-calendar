# Optimization policy:
#	-O3 -flto -DNDEBUG -DNLOG \

build:
	docker run --rm -v ${PWD}:/src -u $(id -u):$(id -g) emscripten/emsdk \
		emcc \
		-s MODULARIZE=1 -s 'EXPORT_NAME="whenAppModuleReady"' \
		-s EXPORTED_FUNCTIONS="[_malloc,_free,_accept]" \
		--closure=1 \
		--js-library src/c/js_library/js_library.js \
		-std=c99 -Wall -Wextra -O3 -DNDEBUG \
		src/c/emscripten-api.c \
			src/c/shared/string_index_of.c \
			src/c/shared/string_copy.c \
			src/c/shared/string_length.c \
			src/c/shared/string_equals.c \
			src/c/shared/string_startsWith.c \
			src/c/shared/date_from_string.c \
			src/c/shared/date_to_string.c \
			src/c/shared/days_since_epoch.c \
			src/c/shared/small_int_from_string.c \
			src/c/dynamic/series.c \
			src/c/template.c \
			src/c/ioserver.c \
			src/c/request.c \
			src/c/route_calendar/grid_template.c \
			src/c/route_calendar/route_calendar.c \
		-o dist/app-module.js


run:
	docker run -it --rm -v ${PWD}:/home -u $(id -u):$(id -g) silkeh/clang /bin/bash


nextbuild:
	docker run --rm -v ${PWD}:/home -u $(id -u):$(id -g) silkeh/clang \
		clang \
		-O3 -DNDEBUG -fno-builtin-memset -std=c99 -Wall -Wextra \
		--target=wasm32 -nostdlib -fvisibility=hidden \
		-Wl,-allow-undefined-file home/src/c/js_library/wasm.syms \
		-Wl,--no-entry \
		-Wl,--strip-all \
		-Wl,--export-dynamic \
		-Wl,--import-memory \
		-Wl,--export=__heap_base \
		home/src/c/api.c \
			home/src/c/shared/string_index_of.c \
			home/src/c/shared/string_copy.c \
			home/src/c/shared/string_length.c \
			home/src/c/shared/string_equals.c \
			home/src/c/shared/string_startsWith.c \
			home/src/c/shared/date_from_string.c \
			home/src/c/shared/date_to_string.c \
			home/src/c/shared/days_since_epoch.c \
			home/src/c/shared/small_int_from_string.c \
			home/src/c/dynamic/series.c \
			home/src/c/template.c \
			home/src/c/ioserver.c \
			home/src/c/request.c \
			home/src/c/route_calendar/grid_template.c \
			home/src/c/route_calendar/route_calendar.c \
		-o home/dist/next-app-module.wasm