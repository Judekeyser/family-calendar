
export default function init(templateMap) {
const map = new Map();
templateMap.set("calendar_grid_rows", map);

map.set(0, "<table> <thead> <tr> <th><abbr>Lun.</abbr></th> <th><abbr>Mar.</abbr></th> <th><abbr>Mer.</abbr></th> <th><abbr>Jeu.</abbr></th> <th><abbr>Ven.</abbr></th> <th><abbr>Sam.</abbr></th> <th><abbr>Dim.</abbr></th> </tr> </thead> ");
map.set(1, " <tbody> <tr class=\"bar\"> <th colspan=\"7\" ><app-french-month strmonth=\"");
map.set(2, "\"></app-french-month> </th> </tr> ");
map.set(3, " <tr> ");
map.set(4, " <td ");
map.set(5, " >");
map.set(6, "</td> ");
map.set(7, " </tr> ");
map.set(8, " </tbody> ");
map.set(9, " </table>");

};
