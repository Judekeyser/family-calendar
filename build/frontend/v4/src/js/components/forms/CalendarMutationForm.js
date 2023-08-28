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


customElements.define("app-calendar-mutation-form", class extends HTMLElement {
    static get observedAttributes() {
        return [
            'preferred-date',
            'preferred-time',
            'preferred-description',
            'preferred-details',
            'preferred-is-day-off'
        ];
    }
    constructor() {
        super();

        this._cache = undefined;
        this._value = {
            date: '',
            timeNumeric: '',
            timeRange: '',
            isDayOff: false,
            description: '',
            details: ''
        };
    }

    connectedCallback() {
        const {
            formController,
            dateController,
            timeRangeController,
            timeNumericController,
            isDayOffController,
            cancelController
        } = this.#cache;

        formController.addEventListener("submit", event => {
            event.preventDefault();
            this.dispatchEvent(new CustomEvent(
                "app-calendar-mutation-form-submit",
                {
                    detail: this.submit
                }
            ));
        });

        for(const controller of [
            dateController,
            timeRangeController,
            timeNumericController,
            isDayOffController
        ]) {
            controller.addEventListener("change", () => {
                this.#rectifyAfterChange();
                this.#emitChange()
            });
        }

        if(cancelController) {
            cancelController.addEventListener("change", () => {
                this.#rectifyAfterCancelStateChange();
                this.#emitChange();
            });
            cancelController.checked = false;
            cancelController.disabled = false;
        }

        this.#rectifyAfterLoad();
    }

    /**
     * 
     * @param {(
     *  'preferred-date',
     *  'preferred-time',
     *  'preferred-description',
     *  'preferred-details',
     *  'preferred-is-day-off'
     * )} name 
     * @param {string | undefined} _oldValue 
     * @param {string | undefined} newValue 
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        switch(name) {
            case "preferred-date": {
                this._value.date = newValue || '';
            } break;
            case "preferred-time": {
                this._value.timeRange = timeRangeOf(newValue || '');
                this._value.timeNumeric = timeNumericOf(newValue || '');
            } break;
            case "preferred-description": {
                this._value.description = newValue || '';
            } break;
            case "preferred-details": {
                this._value.details = newValue || '';
            } break;
            case "preferred-is-day-off": {
                this._value.isDayOff = newValue === 'yes';
            } break;
        }

        this.#rectifyAfterLoad();
    }

    #rectifyAfterLoad() {
        const {
            dateController,
            timeRangeController,
            timeNumericController,
            isDayOffController,
            descriptionController,
            detailsController,
            cancelController
        } = this.#cache;
        const value = this._value;

        isDayOffController.checked = value.isDayOff;
        isDayOffController.disabled = false;
        
        if(value.isDayOff) {
            timeRangeController.value = 'fullday';
            timeRangeController.disabled = true;

            timeNumericController.value = '';
            timeNumericController.disabled = true;
        } else {
            timeRangeController.value = value.timeRange;
            timeRangeController.disabled = false;
            if(!value.timeRange) {
                timeNumericController.value = value.timeNumeric;
                timeNumericController.disabled = false;
                timeNumericController.required = true;
            } else {
                timeNumericController.value = '';
                timeNumericController.disabled = true;
                timeNumericController.required = false;
            }
        }

        dateController.value = value.date;
        dateController.disabled = false;

        descriptionController.value = value.description;
        descriptionController.disabled = false;

        detailsController.value = value.details;
        detailsController.disabled = false;
    };

    #rectifyAfterCancelStateChange() {
        this.#rectifyAfterLoad();
        if(this.#cache.cancelController.checked) {
            const {
                dateController,
                timeRangeController,
                timeNumericController,
                isDayOffController,
                descriptionController,
                detailsController
            } = this.#cache;

            const controllersToFreeze = [
                dateController,
                timeNumericController,
                timeRangeController,
                isDayOffController,
                descriptionController,
                detailsController
            ];

            for(const controller of controllersToFreeze) {
                controller.disabled = true;
            }
        }
    }

    #rectifyAfterChange() {
        const {
            timeRangeController,
            timeNumericController,
            isDayOffController
        } = this.#cache;

        // Time Range is frozen on fullday for days off
        if(isDayOffController.checked) {
            timeRangeController.value = 'fullday';
            timeRangeController.disabled = true;
        } else {
            timeRangeController.disabled = false;
        }

        // Time Numeric is frozen when some time range
        if(timeRangeController.value) {
            timeNumericController.disabled = true;
            timeNumericController.value = '';
            timeNumericController.required = false;
        } else {
            timeNumericController.disabled = false;
            timeNumericController.required = true;
        }
    }

    #emitChange() {
        const {
            dateController,
            timeRangeController,
            timeNumericController,
            isDayOffController,
            descriptionController,
            detailsController,
            cancelController
        } = this.#cache;

        this.dispatchEvent(new CustomEvent(
            "app-calendar-mutation-form-change",
            {
                detail: {
                    date: dateController.value || undefined,
                    time: (
                        timeRangeController.value
                            || timeNumericController.value || undefined
                    ),
                    description: descriptionController.value || undefined,
                    details: detailsController.value || undefined,
                    isDayOff: isDayOffController.checked,
                    cancel: cancelController && cancelController.checked
                }
            }
        ));
    }

    get #cache() {
        if(!this._cache) {
            const formController = (
                /**
                 * @type {HTMLElement}
                 */ (
                    this.querySelector("form")
                 )
            );
            this._cache = {
                formController,
                dateController: formController['dateController'],
                timeRangeController: formController['timeRangeController'],
                timeNumericController: formController['timeNumericController'],
                isDayOffController: formController['isDayOffController'],
                descriptionController: formController['descriptionController'],
                detailsController: formController['detailsController'],
                cancelController: formController['cancelController']
            };
        }
        return this._cache;
    }

    submit = async action => {
        const {
            dateController,
            timeRangeController,
            timeNumericController,
            descriptionController,
            detailsController,
            isDayOffController,
            cancelController
        } = this.#cache;

        if(cancelController && cancelController.checked) {
            await action({
                cancel: true
            });
        } else {
            await action({
                cancel: false,
                isDayOff: isDayOffController.checked,
                strDate: dateController.value || undefined,
                strTime: (
                    timeRangeController.value ||
                    timeNumericController.value || undefined
                ),
                strDescription: descriptionController.value || undefined,
                strDetails: detailsController.value || undefined
            });
        }
    };
});
