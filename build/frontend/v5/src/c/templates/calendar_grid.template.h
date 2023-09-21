
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


# ifndef TMPL_T_BLOCKS
#    error Symbol `TMPL_T_BLOCKS` undefined
# endif


# ifndef TMPL_T_ROWS
#    error Symbol `TMPL_T_ROWS` undefined
# endif


# ifndef TMPL_T_COLS
#    error Symbol `TMPL_T_COLS` undefined
# endif


static void run(TMPL_T_ROOT n0)
{
    char id_chunk[96];
#   ifdef NDEBUG
    for(int i = 0; i < 64; i++) id_chunk[i] = '!';
#   endif


template_emit_fragment("calendar_grid:0"); {
TMPL_T_BLOCKS n1;
for(
 int i1 = 1;
 i1 < 95 && (n1 = n0 -> blocks(n0));
 i1++
) {
             template_emit_fragment("calendar_grid:1"); {
TMPL_T_ROWS n2;
for(
 int i2 = 1;
 i2 < 95 && (n2 = n1 -> rows(n1));
 i2++
) {
             template_emit_fragment("calendar_grid:2"); {
TMPL_T_COLS n3;
for(
 int i3 = 1;
 i3 < 95 && (n3 = n2 -> cols(n2));
 i3++
) {
             template_emit_fragment("calendar_grid:3"); {
    template_id_footprint(id_chunk, "50686", 3, i1, i2, i3);
    assert(string_length(id_chunk) < 50, "ID overflows 50 characters");
    id_chunk[95] = '\0';
    template_emit_uuid(id_chunk);
} template_emit_class(id_chunk, "hidden"); template_emit_fragment("calendar_grid:4"); template_emit((n3 -> strdate)(n3)); template_emit_fragment("calendar_grid:5"); } } template_emit_fragment("calendar_grid:6"); } } template_emit_fragment("calendar_grid:7"); } } template_emit_fragment("calendar_grid:8");

}
