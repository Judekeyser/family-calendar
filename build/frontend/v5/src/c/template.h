#ifndef APP_TEMPLATE
#define APP_TEMPLATE

/** Factory helpers **/

void template_id_footprint(char* id_chunk, const char* suffix, int is, ...);

/** Emissions **/

int template_emit(const char* raw_string);

#endif
