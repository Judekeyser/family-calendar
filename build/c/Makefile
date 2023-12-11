wasm:
	docker run --rm -v ${PWD}:/home -u $(id -u):$(id -g) silkeh/clang \
		clang --target=wasm32 \
		-Os -std=c99 -nostdlib -Wextra -Wall -Werror -Wconversion -fsigned-char -pedantic-errors \
		-finput-charset=utf-8 -fexec-charset=utf-8 \
		-flto \
		-Wl,-allow-undefined \
		-Wl,--import-memory \
		-Wl,--export=__heap_base \
			home/src/main.c \
			home/src/std/impl.c \
			src/types/impl.c \
			home/src/string/impl.c \
			home/src/date/impl.c \
			home/src/time/impl.c \
			home/src/url/impl.c \
			home/src/french/impl.c \
		-o home/dist/app.wasm
	cp dist/app.wasm ../frontend/v5/dist/


build:
	gcc -DMAINAPP \
		-Os -std=c99 -Wextra -Wall -Werror -Wconversion -fsigned-char -pedantic-errors \
		-finput-charset=utf-8 -fexec-charset=utf-8 \
			src/main.c \
			src/types/impl.c \
			src/std/impl.c \
		-o dist/app.out
	dist/app.out