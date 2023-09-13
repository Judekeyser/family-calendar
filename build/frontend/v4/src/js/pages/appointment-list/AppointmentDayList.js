import {
    forgeTemplateScope, forgeData
} from '../../components/appointments-list/AbstractAppointmentsList.js';
import { MonadicIteratorMap } from '../../algebra/MonadicIteratorMap.js';
import { validateDateString } from '../../date-utils';


/**
 * @this {AppPage}
 * @param {{ strDate: string }} _ 
 * @returns {Promise.<unknown>}
 */
async function paintAppointmentDayList({ strDate }) {
    let { view } = await this.state;

    const date = validateDateString(strDate);
    if(date) {
        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        /**
         * @type {Map.<TimeString,EventData>}
         */
        let source = view.get(date) || new Map();

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
                hasAppointments: source.size
            },
            "0"
        );

        const targetListContainer = this.anchorElement.querySelector(
            "*[data-id=appointments_list]"
        );
        if(targetListContainer) {
            const templateData = (
                (
                    /**
                     * @type {MonadicIteratorMap.<
                     *  [TimeString, EventData],
                     *  [TimeString, EventData]
                     * >}
                     */ (new MonadicIteratorMap())
                ).map(
                    ([strTime, eventData]) => forgeData({
                        strDate: date,
                        strTime,
                        eventData
                    }, this.navigateTo)
                )
            ).apply(source.entries());

            this.getTemplate("appointment_list")(
                targetListContainer,
                forgeTemplateScope(
                    templateData,
                    { sort: true }
                ),
                "1"
            );
        }
    }
    return undefined;
}


const TEMPLATE_ID = "day-appointments_main";
function AppointmentDayList() {}
AppointmentDayList.prototype = {
    paint: paintAppointmentDayList
};


export { AppointmentDayList, paintAppointmentDayList };