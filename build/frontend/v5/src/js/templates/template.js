
import calendar_grid from './calendar_grid.template.js';
import calendar_grid_rows from './calendar_grid_rows.template.js';
const templateMap = Object.freeze((() => {
    const mutMap = new Map();
calendar_grid(mutMap);
calendar_grid_rows(mutMap);
    return mutMap;
})());

export {templateMap};
