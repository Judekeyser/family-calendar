import { now } from '../../date-utils.js';
import { safeCompileOnce } from '../../template-engine.js';
import { AppointmentList } from './AppointmentList.js';


function* unreadEntriesGenerator(newEvents, view) {
    console.log(newEvents, view);
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
    this.__templates = safeCompileOnce(
        document.getElementById(TEMPLATE_ID).innerText
    );
    this.__listHandler = new AppointmentList();
}
UnreadAppointmentList.prototype = {
    paint: async function() {
        let { view, newEvents } = await this.state;

        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        let hasAppointments = !!newEvents.length;

        this.__templates(
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
            }
        );

        if(hasAppointments) {
            this.__listHandler.hydrate(
                this,
                unreadEntriesGenerator(newEvents, view),
                { sort: true }
            );
        }

    }
};


export { UnreadAppointmentList };