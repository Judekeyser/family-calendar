import { recordSorting } from '../../date-utils.js';


function* generateList(records, navigateTo, options) {
    let iterableRecords = records;
    if(options && options.sort) {
        let sortedRecords = [...records];
        sortedRecords = sortedRecords.sort(recordSorting);
        iterableRecords = sortedRecords;
    }
    for(const {
        strDate, strTime,
        strDescription, strDetails,
        isDayOff,
        markUnread
    } of iterableRecords) {
        yield {
            strDate,
            strTime,
            markUnread,
            strDescription,
            strDetails,
            isDayOff,
            handleClick: () => {
                navigateTo({
                    url: '/calendar/mutate/modify',
                    parameters: {
                        preferredDate: strDate,
                        preferredTime: strTime
                    }
                });
            }
        };
    }
}


const TEMPLATE_ID = "appointments_list";

function AppointmentList() {}
AppointmentList.prototype = {
    hydrate: async function(ctx, entriesGenerator, options) {
        let appointments = generateList(
            entriesGenerator, ctx.navigateTo, options
        );
        ctx.getTemplate(TEMPLATE_ID)(
            ctx.anchorElement.querySelector(`*[data-id=${TEMPLATE_ID}]`),
            { appointments },
            options.prefix
        );
    },
    clear: function(ctx) {
        ctx.anchorElement.querySelector(
            `*[data-id=${TEMPLATE_ID}]`
        ).innerHTML = "";
    }
};


export { AppointmentList };