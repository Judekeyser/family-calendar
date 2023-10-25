
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"


# ifndef TMPL_T_ROOT
#    error Symbol `TMPL_T_ROOT` undefined
# endif


static const char* const appointment_form_0 = "<main> <h1>Créer un rendez-vous ";
static const char* const appointment_form_1 = "</h1> <form> <fieldset> <div> <p> <label>Jour du rendez-vous</label>:&#160;<br ><input type=\"date\" name=\"dateController\" required> </p> <p> <input type=\"checkbox\" name=\"isDayOffController\" ><label>Jour férié&#160;?&#160;&#9969;</label> </p> </div> <div> <p> <label>Plage horaire</label>:&#160;<br ><select name=\"timeRangeController\"> <option value=\"\">Ponctuel</option> <option value=\"fullday\">Toute la journée</option> <option value=\"morning\">La matinée</option> <option value=\"afternoon\">L'après-midi</option> </select> </p> <p> <label>Heure du rendez-vous</label>:&#160;<br ><input type=\"time\" name=\"timeNumericController\"> </p> </div> </fieldset> <fieldset> <p> <label>Description du rendez-vous.</label><br> <small>Un texte succinct permet d'améliorer la recherche par mots-clé.</small> <br> <textarea name=\"descriptionController\" cols=\"40\" rows=\"4\" required></textarea> </p> <p> <label>Commentaires</label><br> <small>(lieu, papiers à apporter, &hellip;).</small> <br> <textarea name=\"detailsController\" cols=\"40\" rows=\"4\"></textarea> </p> </fieldset> <hr> <p> <label><input type=\"checkbox\" name=\"cancelController\">Annuler le rendez-vous</label> </p> <p> <button>Valider</button> </p> </form> </main>";

static void run(TMPL_T_ROOT n0)
{


template_emit(appointment_form_0); template_emit((n0 -> dummy)(n0)); template_emit(appointment_form_1);

}
