import { safeCompileOnce } from '../template-engine.js';
import { strTimeOverlap } from '../date-utils.js';

import { AppointmentList } from './appointment-list/AppointmentList.js';


const TEMPLATE_ID = "calendar-mutation-form";
function CalendarMutationPage() {
    this.__template = safeCompileOnce(
        document.getElementById(TEMPLATE_ID).innerText
    );
    this.__listHandler = new AppointmentList();
}
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


        this.__template(
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
            }
        );
    },

    showConflicts: function(
        { strTime, strDate },
        { preferredDate, preferredTime },
        view
    ) {
        let conflicts = [];
        if(strDate && strTime) {
            if(preferredDate != strDate || preferredTime != strTime) {
                conflicts = [...new Map(view.get(strDate)).entries()]
                    .filter(([_strTime]) => strTimeOverlap(strTime, _strTime))
                    .filter(([_strTime]) => preferredTime !== _strTime)
                    .map(([_strTime, record]) => ({
                        strTime: _strTime,
                        strDate,
                        strDescription: record.description,
                        strDetails: undefined,
                        markUnread: record.unread,
                    }));
            }
        }

        let maskContainer = this.anchorElement.querySelector(
            "*[data-id=conflicts_container]"
        );
        this.__listHandler.clear(this);
        if(conflicts.length) {
            this.__listHandler.hydrate(this, conflicts, { sort: true });
            maskContainer.classList.remove("hidden");
        } else {
            maskContainer.classList.add("hidden");
        }
    },

    submitCalendarMutation: function({ preferredDate, preferredTime }) {
        return async (formData) => {
            const { cancel } = formData;
            if(cancel) {
                await this.cancelEvent({
                    strDate: preferredDate,
                    strTime: preferredTime
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
                        strDate,
                        strTime,
                        strDescription,
                        strDetails,
                        isDayOff
                    });
                } else {
                    await this.editEvent({
                        toCreate: {
                            strDate,
                            strTime,
                            strDescription,
                            strDetails,
                            isDayOff
                        },
                        toCancel: {
                            strDate: preferredDate,
                            strTime: preferredTime
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