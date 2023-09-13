#include "./template.h"

# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif

# ifndef TMPL_T_BLOCKS
#   error Symbol `TMPL_T_BLOCKS` undefined
# endif

# ifndef TMPL_T_ROWS
#   error Symbol `TMPL_T_ROWS` undefined
# endif

# ifndef TMPL_T_COLS
#   error Symbol `TMPL_T_COLS` undefined
# endif


static void run(TMPL_T_ROOT n0)
{
    char id_chunk[64];
#   ifdef NDEBUG
    for(int i = 0; i < 64; i++) id_chunk[i] = '!';
#   endif

    emit_slice("<table>");
    {
        TMPL_T_BLOCKS n1;
        for(int i1 = 1;i1 < 95 && (n1 = n0 -> blocks(n0)); i1++) {
            emit_slice("<tbody>");
            {
                TMPL_T_ROWS n2;
                for(int i2 = 1;i2 < 95 && (n2 = n1 -> rows(n1));i2++) {
                    emit_slice("<tr>");
                    {
                        TMPL_T_COLS n3;
                        for(int i3 = 1;i3 < 95 && (n3 = n2 -> cols(n2));i3++) {
                            emit_slice("<td ");
                            {
                                id_foot_print(id_chunk, "879", 3, i1, i2, i3);
                                assert(strlen(id_chunk) < 50);

                                emit_slice(" data-uuid='");
                                emit_slice(id_chunk);
                                emit_slice("' ");
                            }
                            emit_slice(">");
                            emit_slice(n3 -> strdate(n3));
                            emit_slice("</td>");
                        }
                    }
                    emit_slice("</tr>");
                }
            }
            emit_slice("</tbody>");
        }
    }
    emit_slice("</table>");
}

static void simple_test(TMPL_T_ROWS n2)
{
    char id_chunk[64];
#   ifdef NDEBUG
    for(int i = 0; i < 64; i++) id_chunk[i] = '!';
#   endif
    emit_slice("<tr>");
    LOG_FLUSH
    {
        TMPL_T_COLS n3;
        for(int i3 = 1;i3 < 95 && (n3 = n2 -> cols(n2));i3++) {
            emit_slice("<td ");
            {
                id_foot_print(id_chunk, "879", 1, i3);
                assert(strlen(id_chunk) < 50);
                id_chunk[50] = '\0';

                emit_slice(" data-uuid='");
                emit_slice(id_chunk);
                emit_slice("' ");
            }
            emit_slice(">");
            emit_slice(n3 -> strdate(n3));
            emit_slice("</td>");
            LOG_FLUSH
        }
    }
    emit_slice("</tr>");
    LOG_FLUSH
}