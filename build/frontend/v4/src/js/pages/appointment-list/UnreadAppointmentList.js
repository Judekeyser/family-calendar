import { now } from '../../date-utils.js';
import {
    forgeTemplateScope, forgeData
} from '../../components/appointments-list/AbstractAppointmentsList.js';
import { MonadicIteratorMap } from '../../algebra/MonadicIteratorMap.js';


const TEMPLATE_ID = "unread-appointments_main";
function UnreadAppointmentList() {}
UnreadAppointmentList.prototype = {
    paint: async function() {
        const { view, newEvents } = await this.state;

        const hasAppointments = !!newEvents.length;

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
            const templateData = (
                new MonadicIteratorMap().map(
                    ({ strDate, strTime }) => forgeData({
                        strDate, strTime,
                        eventData: new Map(view.get(strDate)).get(strTime)
                    }, this.navigateTo)
                )
            ).apply(newEvents);

            this.getTemplate("appointment_list")(
                this.anchorElement.querySelector(
                    "*[data-id=appointments_list]"
                ),
                forgeTemplateScope(
                    templateData,
                    { sorted: true }
                ),
                "1"
            );
        }

    }
};


export { UnreadAppointmentList };