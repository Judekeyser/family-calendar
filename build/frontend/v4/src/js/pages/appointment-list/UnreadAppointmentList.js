import { now } from '../../date-utils.js';
import { AppointmentList } from './AppointmentList.js';


function* unreadEntriesGenerator(newEvents, view) {
    for(let { strDate, strTime } of newEvents) {
        const entry = view.get(strDate).get(strTime);
        const strDescription = entry.description;
        const strDetails = entry.details;
        const isDayOff = entry.isDayOff || false;
        yield {
            strDate, strTime,
            strDescription,
            strDetails,
            isDayOff
        };
    }
}


const TEMPLATE_ID = "unread-appointments_main";
function UnreadAppointmentList() {
    this.__listHandler = new AppointmentList();
}
UnreadAppointmentList.prototype = {
    paint: async function() {
        let { view, newEvents } = await this.state;

        let hasAppointments = !!newEvents.length;

        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);
        this.getTemplate(TEMPLATE_ID)(
            this.anchorElement,
            {
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
                                preferredDate: now()
                            }
                        }),
                    },
                    markRead: hasAppointments ? {
                        handleClick: ((self) => async function() {
                            this.disabled = true;
                            try {
                                await self.markRead();
                                history.back();
                            } finally {
                                this.disabled = false;
                            }
                        })(this)
                    } : undefined
                },
                hasAppointments
            },
            "0"
        );

        if(hasAppointments) {
            this.__listHandler.hydrate(
                this,
                unreadEntriesGenerator(newEvents, view),
                { sort: true, prefix: "1" }
            );
        }

    }
};


export { UnreadAppointmentList };