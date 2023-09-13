import { strTimeOverlap } from '../date-utils.js';
import {
    forgeTemplateScope, forgeData
} from '../components/appointments-list/AbstractAppointmentsList.js';
import { MonadicIteratorMap } from '../algebra/MonadicIteratorMap.js';


const TEMPLATE_ID = "calendar-mutation-form";
function CalendarMutationPage() {}
CalendarMutationPage.prototype = {
    paint: async function({ preferredDate, preferredTime }) {
        let { view } = await this.state;
        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        let preferredDescription, preferredDetails, preferredIsDayOff;
        {
            preferredDescription = '';
            if(preferredDate && preferredTime) {
                let entriesforDate = view.get(preferredDate);
                let entriesforDateTime = (
                    new Map(entriesforDate)
                ).get(preferredTime);
                preferredDescription = (
                    entriesforDateTime.description
                );
                preferredDetails = entriesforDateTime.details;
                preferredIsDayOff = entriesforDateTime.isDayOff;
            }
        }


        this.getTemplate(TEMPLATE_ID)(
            this.anchorElement,
            {
                "preferred-date": preferredDate,
                "preferred-time": preferredTime,
                "preferred-description": preferredDescription,
                "preferred-details": preferredDetails,
                "preferred-is-day-off": preferredIsDayOff ? 'yes' : 'no',

                handleAppCalendarMutationFormSubmit: ({ detail }) => {
                    const actionRunner = detail;
                    const action = this.submitCalendarMutation({
                        preferredDate,
                        preferredTime
                    });
                    return actionRunner(action);
                },

                handleAppCalendarMutationFormChange: ({ detail }) => {
                    const { date, time } = detail;

                    this.showConflicts(
                        {
                            strTime: time,
                            strDate: date
                        },
                        {preferredDate, preferredTime},
                        view
                    );
                },

                ...this.templateParameters
            },
            "0"
        );
    },

    showConflicts: function(
        { strTime, strDate },
        { preferredTime },
        view
    ) {
        const conflicts = [...new MonadicIteratorMap().debug()
            .filter(
                ([date, time]) => date && time && preferredTime != time
            ).map(
                ([date, time]) => ([view.get(date), date, time])
            ).filter(
                ([view]) => !!view
            ).flatMap(
                ([view, date, time]) => new MonadicIteratorMap().debug().filter(
                    ([timeEntry]) => time != timeEntry &&
                                        strTimeOverlap(time, timeEntry)
                ).map(
                    ([timeEntry, recordEntry]) => forgeData({
                        strDate: date,
                        strTime: timeEntry,
                        eventData: recordEntry
                    })
                ).apply(view.entries())
            )
        .apply([[strDate, strTime]])];

        console.log(conflicts);

        const maskContainer = this.anchorElement.querySelector(
            "*[data-id=conflicts_container]"
        );
        if(conflicts.length) {
            this.getTemplate("appointment_list")(
                maskContainer,
                forgeTemplateScope(
                    conflicts,
                    { sorted: true }
                ),
                "1"
            );
            maskContainer.classList.remove("hidden");
        } else {
            maskContainer.classList.add("hidden");
            maskContainer.innerHTML = "";
        }
    },

    submitCalendarMutation: function({ preferredDate, preferredTime }) {
        return async (formData) => {
            const { cancel } = formData;
            if(cancel) {
                await this.cancelEvent({
                    date: preferredDate,
                    time: preferredTime
                });
            } else {
                const {
                    strDate, strTime, isDayOff,
                    strDescription, strDetails
                } = formData;
                if( !preferredDate || !preferredTime || (
                    preferredDate === strDate && preferredTime === strTime
                )) {
                    await this.createEvent({
                        date: strDate,
                        time: strTime,
                        strDescription,
                        strDetails,
                        isDayOff
                    });
                } else {
                    await this.editEvent({
                        toCreate: {
                            date: strDate,
                            time: strTime,
                            strDescription,
                            strDetails,
                            isDayOff
                        },
                        toCancel: {
                            date: preferredDate,
                            time: preferredTime
                        }
                    });
                }
            }

            this.navigateTo({
                url: '/calendar-grid',
                parameters: {}
            });
            return undefined;
        };
    }

};

/** CREATION PAGE */

function CalendarMutationCreatePage() {
    CalendarMutationPage.call(this);
}
CalendarMutationCreatePage.prototype = {
    templateParameters: {
        allowCancel: false,
        pageTitle: "Créer un rendez-vous",
        submitText: "Créer"
    }
};
Object.setPrototypeOf(
    CalendarMutationCreatePage.prototype,
    CalendarMutationPage.prototype
);

/** EDITION PAGE  */

function CalendarMutationModifyPage() {
    CalendarMutationPage.call(this);
}
CalendarMutationModifyPage.prototype = {
    templateParameters: {
        allowCancel: true,
        pageTitle: "Modifier le rendez-vous",
        submitText: "Modifier"
    }
};
Object.setPrototypeOf(
    CalendarMutationModifyPage.prototype,
    CalendarMutationPage.prototype
);


export { CalendarMutationCreatePage, CalendarMutationModifyPage };