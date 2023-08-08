import { compile } from '../template-engine.js'


function submitForm(formElement, createEvent) {
    let strDate = formElement.strDate.value || undefined
    let strTimeNumeric = formElement.strTimeNumeric.value || undefined
    let strTimeRange = formElement.strTimeRange.value || undefined
    let strDescription = formElement.strDescription.value || ''

    let strTime = strTimeRange || strTimeNumeric

    ;(async () => {
        let controllers = [
            formElement.strDate,
            formElement.strTimeNumeric,
            formElement.strTimeRange,
            formElement.strDescription,
            formElement.querySelector("button")
        ]
        let disabbleStates = controllers.map(_ => _.disabled)

        try {
            for(let ctrl of controllers) {
                ctrl.disabled = true
            }
            await createEvent({ strDate, strTime, strDescription })
        } finally {
            for(let i = 0; i < controllers.length; i++) {
                controllers[i].disabled = disabbleStates[i]
            }
        }
    })()
}

function CalendarMutationPage() {
    this.__templates = {
        main: compile(document.getElementById("calendar-mutation-form").innerText),
        list: compile(document.getElementById("calendar-mutation-form_conflicts").innerText)
    }
}
CalendarMutationPage.prototype = {
    paint: async function({ preferredDate, allowCancel }) {
        let { view } = await this.state

        this.__templates.main(
            this.anchorElement,
            {
                handleSubmit: e => {
                    e.preventDefault()
                    submitForm(e.target, this.createEvent)
                },
                preferredDate,
                allowCancel,
                handleChange: e => this.handleChange(e.target.form, { preferredDate, allowCancel }, view),
                pageTitle: "Créer un rendez-vous",
                submitText: "Créer"
            }
        ).next()

        this.__rehydrateConflicts = this.__templates.list(
            this.anchorElement.querySelector("*[data-id=calendar-mutation-form_conflicts]"),
            {
                anyConflict: false
            }
        ); this.__rehydrateConflicts.next()

        this.handleChange(
            this.anchorElement.querySelector("form[data-id=calendar-mutation-form]"),
            { preferredDate, allowCancel },
            view
        )
    },
    
    handleChange: function(formElement, { preferredDate, allowCancel }, view) {
        let strTimeRange = formElement.strTimeRange.value || undefined

        if(!strTimeRange) {
            formElement.strTimeNumeric.required = true
            formElement.strTimeNumeric.disabled = false
        } else {
            formElement.strTimeNumeric.disabled = true
            formElement.strTimeNumeric.required = false
        }

        let strTime = strTimeRange || formElement.strTimeNumeric.value
        let strDate = formElement.strDate.value
        this.showConflicts({ strTime, strDate }, view)
    },

    showConflicts: function({ strTime, strDate }, view) {
        if(strDate && strTime) {
            let conflict = (new Map(view.get(strDate))).get(strTime)
            if(conflict) {
                this.__rehydrateConflicts.next({
                    anyConflict: true,
                    conflictingAppointment: conflict.description
                })
                return
            }
        }
        this.__rehydrateConflicts.next({
            anyConflict: false
        })
    }

}


export { CalendarMutationPage }