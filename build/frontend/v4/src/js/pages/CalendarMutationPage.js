import { safeCompileOnce } from '../template-engine.js';
import { strTimeOverlap } from '../date-utils.js';

import { AppointmentList } from './appointment-list/AppointmentList.js';


/**
 * 
 * @param {string} strTime 
 * @returns {string}
 */
function timeRangeOf(strTime)
{
    switch(strTime) {
        case "fullday":
        case "morning":
        case "afternoon":
            return strTime;
        default:
            return '';
    }
}

/**
 * 
 * @param {string} strTime 
 * @returns {string}
 */
function timeNumericOf(strTime) {
    switch(strTime) {
        case "fullday":
        case "morning":
        case "afternoon":
            return '';
        default:
            return strTime;
    }
}

/**
 * @typedef {{
 *  preferredDate: string,
 *  preferredTime: string
 * }} TemporalPreferredKey
 * 
 * @typedef {TemporalPreferredKey &
 *           { preferredDescription: string } &
 *           { preferredDetails: string? } &
 *           { preferredIsDayOff: boolean }
 * } Preferences
 */


/**
 * 
 * @param {*} formElement 
 * @param {Preferences} preferences 
 * @returns {{cancel: true} | {
 *            strTime: string | undefined,
 *            strDate: string | undefined,
 *            cancel: false
 *          }}
 * ----------------------------------------------------------------------------
 */
function rectifyAfterChange(formElement, preferences)
{
    const {
        preferredDate, preferredTime,
        preferredDescription, preferredDetails, preferredIsDayOff
    } = preferences;
    const cancel = formElement.cancel ? !!formElement.cancel.checked : false;
    if(cancel) {
        formElement.strDate.value = preferredDate || '';
        formElement.strDescription.value = preferredDescription || '';
        formElement.strDetails.value = preferredDetails || '';
        formElement.isDayOff.checked = preferredIsDayOff || false;
        
        formElement.strTimeNumeric.value = (
            timeNumericOf(preferredTime) || ''
        );
        formElement.strTimeRange.value = (
            timeRangeOf(preferredTime) || ''
        );

        formElement.strTimeRange.disabled = true;
        formElement.strDescription.disabled = true;
        formElement.strDetails.disabled = true;
        formElement.isDayOff.disabled = true;
        formElement.strDate.disabled = true;
        formElement.strTimeNumeric.disabled = true;

        return { cancel };
    }
    else {
        const strDate = (
            /** @type{string | undefined} */
            (formElement.strDate.value)
        ) || undefined;
        const isDayOff = (
            /** @type{boolean} */
            (formElement.isDayOff.checked)
        );

        formElement.strTimeRange.disabled = isDayOff;
        formElement.strDescription.disabled = false;
        formElement.strDetails.disabled = false;
        formElement.strDate.disabled = false;
        formElement.isDayOff.disabled = false;
        if(isDayOff && strDate) {
            formElement.strTimeNumeric.disabled = true;
            formElement.strTimeNumeric.required = false;

            formElement.strTimeNumeric.value = '';
            formElement.strTimeRange.value = 'fullday';

            return {
                strTime: "fullday",
                strDate,
                cancel
            };
        } else {
            const formStrTimeRange = (
                /** @type{string | undefined} */
                (formElement.strTimeRange.value)
             ) || undefined;
             const formStrTimeNumeric = (
                 /** @type{string | undefined} */
                 (formElement.strTimeNumeric.value)
            ) || undefined;

            if(!formStrTimeRange) {
                formElement.strTimeNumeric.required = true;
                formElement.strTimeNumeric.disabled = false;
            } else {
                formElement.strTimeNumeric.disabled = true;
                formElement.strTimeNumeric.required = false;
            }

            return {
                strTime: formStrTimeRange || formStrTimeNumeric || undefined,
                strDate,
                cancel
            };
        }
    }
}


/**
 * 
 * @param {*} formElement 
 * @param {Preferences} preferences 
 */
function setAfterLoad(formElement, preferences) {
    const {
        preferredDate, preferredTime,
        preferredDescription, preferredDetails, preferredIsDayOff
    } = preferences;
    formElement.strDate.value = preferredDate || '';
    formElement.strDescription.value = preferredDescription || '';
    formElement.strDetails.value = preferredDetails || '';
    formElement.isDayOff.checked = preferredIsDayOff || false;

    if(formElement.isDayOff.checked) {
        formElement.strTimeNumeric.value = '';
        formElement.strTimeRange.value = 'fullday';
    } else {
        formElement.strTimeNumeric.value = (
            timeNumericOf(preferredTime) || ''
        );
        formElement.strTimeRange.value = (
            timeRangeOf(preferredTime) || ''
        );
    }

    formElement.strTimeRange.disabled = formElement.isDayOff.checked;
    formElement.strDescription.disabled = false;
    formElement.strDetails.disabled = false;
    formElement.isDayOff.disabled = false;
    formElement.strDate.disabled = false;
    if(!formElement.strTimeRange.value) {
        formElement.strTimeNumeric.required = true;
        formElement.strTimeNumeric.disabled = false;
    } else {
        formElement.strTimeNumeric.disabled = true;
        formElement.strTimeNumeric.required = false;
    }
}


/**
 * @callback SubmitAction
 * @param {{
 *  strDate: string,
 *  strTime: string,
 *  strDescription: string,
 *  strDetails: string?,
 *  isDayOff: boolean,
 *  isCancelling: boolean
 * }} submitData
 * @return {Promise<void>}
 * 
 * 
 * @param {*} formElement 
 * @param {SubmitAction} doSubmit 
 */
function submitForm(formElement, doSubmit)
{
    const strDate = (
        /** @type {string} */
        (formElement.strDate.value)
     ) || undefined;
    const strTimeNumeric = (
        /** @type {string} */
        (formElement.strTimeNumeric.value)
     ) || undefined;
    const strTimeRange = (
        /** @type {string} */
        (formElement.strTimeRange.value)
     ) || undefined;
     const strDescription = (
         /** @type {string} */
         (formElement.strDescription.value)
      ) || '';
    const strDetails = (
        /** @type {string} */
        (formElement.strDetails.value)
    ) || '';
    const isDayOff = (
        /** @type {boolean} */
        (formElement.isDayOff.checked)
    );
    const isCancelling = !!(formElement.cancel && formElement.cancel.checked);

    const strTime = strTimeRange || strTimeNumeric;

    if(!strTime || !strDate || (!isCancelling && !strDescription)) {
        throw "Assertion failed";
    } else {
        (async () => {
            const controllers = [
                formElement.strDate,
                formElement.strTimeNumeric,
                formElement.strTimeRange,
                formElement.strDescription,
                formElement.strDetails,
                formElement.isDayOff,
                formElement.cancel,
                formElement.querySelector("button")
            ];
            const disabbleStates = controllers.map(_ => _ && _.disabled);
    
            try {
                for(const ctrl of controllers) {
                    if(ctrl) {
                        ctrl.disabled = true;
                    }
                }
                await doSubmit({
                    strDate, strTime,
                    strDescription, strDetails, isDayOff,
                    isCancelling
                });
            } finally {
                for(let i = 0; i < controllers.length; i++) {
                    if(controllers[i]) {
                        controllers[i].disabled = disabbleStates[i];
                    }
                }
            }
        })();
    }
}


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
                handleSubmit: e => {
                    e.preventDefault();
                    submitForm(e.target, async ({
                        strTime, strDate,
                        strDescription, strDetails, isDayOff,
                        isCancelling
                    }) => {
                        if(isCancelling) {
                            await this.cancelEvent({ strDate, strTime });
                        } else {
                            if(preferredTime && preferredDate && (
                                strTime !== preferredTime ||
                                strDate !== preferredDate
                            )) {
                                await this.editEvent({
                                    toCancel: {
                                        strTime: preferredTime,
                                        strDate: preferredDate
                                    }, toCreate: {
                                        strTime,
                                        strDate,
                                        strDescription,
                                        strDetails,
                                        isDayOff
                                    }
                                });
                            } else {
                                await this.createEvent({
                                    strTime, strDate,
                                    strDescription, strDetails, isDayOff
                                });
                            }
                        }
                        history.back();
                    });
                },
                handleChange: e => {
                    let { strDate, strTime } = rectifyAfterChange(
                        e.target.form,
                        {
                            preferredDate, preferredTime,
                            preferredDescription, preferredDetails,
                            preferredIsDayOff
                        }
                    );
                    this.showConflicts(
                        { strTime, strDate },
                        { preferredDate, preferredTime },
                        view
                    );
                },
                ...this.templateParameters
            }
        );

        setAfterLoad(
            this.anchorElement.querySelector(`form[data-id=${TEMPLATE_ID}]`),
            {
                preferredDate,
                preferredTime,
                preferredDescription,
                preferredDetails,
                preferredIsDayOff
            }
        );
        
        this.showConflicts(
            { preferredTime, preferredDate},
            {preferredDate, preferredTime},
            view
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