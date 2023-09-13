import { strTimeSorting } from "../../date-utils";


/**
 * @typedef {{
 *  strDate: DateString,
 *  strTime: TimeString,
 *  eventData: EventData
 * }} Appointment - A single record to represent an appointment
 * ----------------------------------------------------------------------------
 */

/**
 * @typedef {{
 *  strDate: DateString,
 *  strTime: TimeString,
 *  strDescription: string,
 *  strDetails: string | undefined,
 *  isDayOff: boolean,
 *  markUnread: boolean,
 *  handleClick: ClickHandler
 * }} AppointmentListTemplateData
 * ----------------------------------------------------------------------------
 */

/**
 * @param {Appointment} appointment 
 * @param {NavigateToCallback} navigateTo 
 * @return {AppointmentListTemplateData}
 * ----------------------------------------------------------------------------
 */
function forgeData(appointment, navigateTo) {
    const { strDate, strTime, eventData } = appointment;
    const { description, details, isDayOff, unread } = eventData;
    return {
        strDate,
        strTime,
        strDescription: description,
        strDetails: details,
        isDayOff: isDayOff,
        markUnread: unread,
        handleClick: () => void navigateTo({
            url: '/calendar/mutate/modify',
            parameters: {
                preferredDate: strDate,
                preferredTime: strTime
            }
        })
    };
}

/**
 * Reshape an iterable of appointments for `appointment-list` template.
 * 
 * @param {Iterable<AppointmentListTemplateData>} appointments  - Template data
 * @param {{
 *  sort: boolean
 * }} [options] - Options for handling the list
 * @return {{
 *  appointments: Iterable<AppointmentListTemplateData>
 * }}
 * ----------------------------------------------------------------------------
 */
function forgeTemplateScope(appointments, options={sort: false}) {
    if(options.sort) {
        const sortedAppointments = (
            Array.isArray(appointments)
                ? appointments : [...appointments]
        ).sort((a,b) => {
            if(a.strDate == b.strDate) {
                return strTimeSorting(a.strTime, b.strTime);
            } else {
                return a.strDate < b.strDate ? -1 : 1;
            }
        });

        return forgeTemplateScope(
            sortedAppointments,
            { sort: false }
        );
    } else {
        return {
            appointments
        };
    }
}


export { forgeTemplateScope, forgeData };
