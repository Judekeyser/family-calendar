import { compile } from '../../template-engine.js'
import { recordSorting } from '../../date-utils.js'


function* generateList(records, navigateTo, options) {
    let iterableRecords = records;
    if(options && options.sort) {
        let sortedRecords = [...records]
        sortedRecords = sortedRecords.sort(recordSorting)
        iterableRecords = sortedRecords
    }
    for(let { strDate, strTime, strDescription, markUnread } of iterableRecords) {
        yield {
            strDate,
            strTime,
            markUnread,
            strDescription,
            handleClick: () => {
                navigateTo({
                    url: '/calendar/mutate/modify',
                    parameters: {
                        preferredDate: strDate,
                        preferredTime: strTime
                    }
                })
            }
        }
    }
}

function AppointmentList() {
    this.__templates = compile(document.getElementById("appointments_list").innerText)
}
AppointmentList.prototype = {
    hydrate: async function(ctx, entriesGenerator, options) {
        let appointments = generateList(entriesGenerator, ctx.navigateTo, options)
        this.__templates(
            ctx.anchorElement.querySelector("*[data-id=appointments_list]"),
            { appointments }
        ).next()
    },
    clear: function(ctx) {
        ctx.anchorElement.querySelector("*[data-id=appointments_list]").innerHTML = ""
    }
}


export { AppointmentList }