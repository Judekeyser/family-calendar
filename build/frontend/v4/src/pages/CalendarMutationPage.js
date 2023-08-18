import { compile } from '../template-engine.js';
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
 *           { preferredDescription: string }
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
    const { preferredDate, preferredTime, preferredDescription } = preferences;
    const cancel = formElement.cancel ? !!formElement.cancel.checked : false;
    if(cancel) {
        formElement.strDate.value = preferredDate || undefined;
        formElement.strDescription.value = preferredDescription || '';
        formElement.strTimeNumeric.value = (
            timeNumericOf(preferredTime) || undefined
        );
        formElement.strTimeRange.value = (
            timeRangeOf(preferredTime) || undefined
        );

        formElement.strTimeRange.disabled = true;
        formElement.strDescription.disabled = true;
        formElement.strDate.disabled = true;
        formElement.strTimeNumeric.disabled = true;

        return { cancel };
    }
    else {
        const formStrTimeRange = (
            /** @type{string | undefined} */
            (formElement.strTimeRange.value)
         ) || undefined;
         const formStrTimeNumeric = (
             /** @type{string | undefined} */
             (formElement.strTimeNumeric.value)
        ) || undefined;
        const formStrDate = (
            /** @type{string | undefined} */
            (formElement.strDate.value)
        ) || undefined;

        formElement.strTimeRange.disabled = false;
        formElement.strDescription.disabled = false;
        formElement.strDate.disabled = false;
        if(!formStrTimeRange) {
            formElement.strTimeNumeric.required = true;
            formElement.strTimeNumeric.disabled = false;
        } else {
            formElement.strTimeNumeric.disabled = true;
            formElement.strTimeNumeric.required = false;
        }
    
        const strTime = formStrTimeRange || formStrTimeNumeric || undefined;
        const strDate = formStrDate || undefined;
    
        return { strTime, strDate, cancel };
    }
}


/**
 * 
 * @param {*} formElement 
 * @param {Preferences} preferences 
 */
function setAfterLoad(formElement, preferences) {
    const { preferredDate, preferredTime, preferredDescription } = preferences;
    formElement.strDate.value = preferredDate || undefined;
    formElement.strDescription.value = preferredDescription || '';
    formElement.strTimeNumeric.value = (
        timeNumericOf(preferredTime) || undefined
    );
    formElement.strTimeRange.value = (
        timeRangeOf(preferredTime) || undefined
    );

    formElement.strTimeRange.disabled = false;
    formElement.strDescription.disabled = false;
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
                    strDescription, isCancelling
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



function CalendarMutationPage() {
    this.__template = compile(
        document.getElementById("calendar-mutation-form").innerText
    );
    this.__listHandler = new AppointmentList();
}
CalendarMutationPage.prototype = {
    paint: async function({ preferredDate, preferredTime }) {
        let { view } = await this.state;

        let preferredDescription;
        {
            preferredDescription = '';
            if(preferredDate && preferredTime) {
                let entriesforDate = view.get(preferredDate);
                let entriesforDateTime = (
                    new Map(entriesforDate)
                ).get(preferredTime);
                let description = entriesforDateTime.description;
                preferredDescription = description || preferredDescription;
            }
        }


        this.__template(
            this.anchorElement,
            {
                handleSubmit: e => {
                    e.preventDefault();
                    submitForm(e.target, async ({
                        strTime, strDate,
                        strDescription, isCancelling
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
                                        strDescription
                                    }
                                });
                            } else {
                                await this.createEvent({
                                    strTime, strDate,
                                    strDescription
                                });
                            }
                        }
                        history.back();
                    });
                },
                handleChange: e => {
                    let { strDate, strTime } = rectifyAfterChange(
                        e.target.form,
                        { preferredDate, preferredDescription, preferredTime }
                    );
                    this.showConflicts(
                        { strTime, strDate },
                        { preferredDate, preferredTime },
                        view
                    );
                },
                ...this.templateParameters
            }
        ).next();

        setAfterLoad(
            this.anchorElement.querySelector(
                "form[data-id=calendar-mutation-form]"
            ),
            {
                preferredDate,
                preferredTime,
                preferredDescription
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
                    .map(([_strTime, record]) => ({
                        strTime: _strTime,
                        strDate,
                        strDescription: record.description,
                        markUnread: record.unread,
                    }));
            }
        }

        let maskContainer = this.anchorElement.querySelector(
            "*[data-id=conflicts_container]"
        );
        if(conflicts.length) {
            this.__listHandler.hydrate(this, conflicts);
            maskContainer.classList.remove("hidden");
        } else {
            maskContainer.classList.add("hidden");
            this.__listHandler.clear(this);
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