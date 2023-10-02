run:
	docker run -it --rm -v ${PWD}:/home -u $(id -u):$(id -g) silkeh/clang /bin/bash


# -O3 -DNDEBUG -fno-builtin-memset

wasm:
	cd build_utils && node template-server.js
	docker run --rm -v ${PWD}:/home -u $(id -u):$(id -g) silkeh/clang \
		clang \
		-Wextra -Os -Wall -Werror -std=c11 -pedantic-errors -nostdlib \
		-fno-stack-protector -Wsign-conversion -Wmissing-variable-declarations -Wcast-qual \
		--target=wasm32 -fvisibility=hidden \
		-Wl,-allow-undefined-file home/src/c/js_library/wasm.syms \
		-Wl,--no-entry \
		-Wl,--strip-all \
		-Wl,--export-dynamic \
		-Wl,--import-memory \
		-Wl,--export=__heap_base \
		home/src/c/api.c \
			home/src/c/shared/unsafe/memset.c \
			home/src/c/shared/string_index_of.c \
			home/src/c/shared/string_copy.c \
			home/src/c/shared/string_length.c \
			home/src/c/shared/string_equals.c \
			home/src/c/shared/string_startsWith.c \
			home/src/c/shared/b64_encode_string_to_string.c \
			home/src/c/shared/date_string.c \
			home/src/c/shared/days_since_epoch_from_string.c \
			home/src/c/shared/days_since_epoch_to_string.c \
			home/src/c/shared/days_since_epoch.c \
			home/src/c/shared/time_slot_of_day.c \
			home/src/c/shared/time_slot_of_day_from_string.c \
			home/src/c/shared/time_slot_of_day_to_string.c \
			home/src/c/shared/time_slot_to_french.c \
			home/src/c/shared/month_to_french.c \
			home/src/c/shared/small_int_from_string.c \
			home/src/c/shared/small_int_on_one_digit.c \
			home/src/c/shared/small_int_on_two_digits.c \
			home/src/c/shared/unsafe/positive_int_to_unsigned_int.c \
			home/src/c/dynamic/numeric_series.c \
			home/src/c/dynamic/string_series.c \
			home/src/c/dynamic/dataframe.c \
			home/src/c/template.c \
			home/src/c/ioserver.c \
			home/src/c/request.c \
			home/src/c/template_engines/calendar_table_template.c \
			home/src/c/template_engines/calendar_grid_template.c \
			home/src/c/template_engines/appointment_list_template.c \
			home/src/c/route_calendar/route_calendar.c \
			home/src/c/route_appointment_list_day/route_appointment_list_day.c \
		-o home/dist/next-app-module.wasm


js:
	npx webpack --config build_utils/webpack/webpack.config.js


run:
	npx webpack serve --open --config build_utils/webpack/webpack.config.js