import { AppointmentList } from './AppointmentList.js';


function* generateEntries(source, strDate) {
    for(let [strTime, record] of source) {
        yield {
            strDate,
            strTime,
            strDescription: record.description,
            strDetails: record.details,
            markUnread: record.unread || false,
            isDayOff: record.isDayOff || false
        };
    }
}


const TEMPLATE_ID = "day-appointments_main";
function AppointmentDayList() {
    this.__listHandler = new AppointmentList();
}
AppointmentDayList.prototype = {
    paint: async function({ strDate }) {
        let { view } = await this.state;
        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        let source = view.get(strDate);
        let hasAppointments = source && source.size;

        this.getTemplate(TEMPLATE_ID)(
            this.anchorElement,
            {
                strDate,
                menu: {
                    back: {
                        handleClick: () => void this.navigateTo({
                            url: '/calendar/grid',
                            parameters: {}
                        })
                    },
                    create: {
                        handleClick: () => void this.navigateTo({
                            url: '/calendar/mutate/create',
                            parameters: {
                                preferredDate: strDate
                            }
                        }),
                    }
                },
                hasAppointments
            },
            "0"
        );

        if(hasAppointments) {
            this.__listHandler.hydrate(
                this,
                generateEntries(source, strDate),
                { sort: true, prefix: "1" }
            );
        }

    }
};


export { AppointmentDayList };