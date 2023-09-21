
export default function init(templateMap) {
const map = new Map();
templateMap.set("calendar_grid", map);

map.set(0, "<table> ");
map.set(1, " <tbody> ");
map.set(2, " <tr> ");
map.set(3, " <td ");
map.set(4, " >");
map.set(5, "</td> ");
map.set(6, " </tr> ");
map.set(7, " </tbody> ");
map.set(8, " </table>");

};
