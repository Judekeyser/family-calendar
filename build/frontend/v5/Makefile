build:
	docker run --rm -v ${PWD}:/src -u $(id -u):$(id -g) emscripten/emsdk \
		emcc \
		-s MODULARIZE=1 -s 'EXPORT_NAME="whenAppModuleReady"' \
		-s EXPORTED_FUNCTIONS="[_main,_accept]" \
		-DNDEBUG \
		--js-library src/c/js_library/js_library.js \
		src/c/api.c \
			src/c/shared/string_equals.c \
			src/c/shared/string_startsWith.c \
			src/c/shared/time_strdate_to_tm.c \
			src/c/shared/time_tm_to_strdate.c \
			src/c/templates/template.c \
			src/c/ioserver.c \
			src/c/request.c \
			src/c/route_calendar/grid_template.c \
			src/c/route_calendar/route_calendar.c \
		-o dist/app-module.js
