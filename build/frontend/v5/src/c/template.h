#ifndef __APP_TEMPLATE__
#define __APP_TEMPLATE__

/** Factory helpers **/

void template_id_footprint(char* id_chunk, const char* suffix, int is, ...);

/** Emissions **/

int template_emit(const char* raw_string);

int template_emit_fragment(const char* fragment_identifier);

int template_emit_uuid(const char* element_identifier);

int template_emit_attribute(const char* element_identifier, const char* attribute_name, const char* value);

int template_emit_class(const char* element_identifier, const char* value);

#endif
