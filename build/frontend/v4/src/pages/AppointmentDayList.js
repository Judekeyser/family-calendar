import { compile } from '../template-engine.js'


function makeCell({ strDate, strTime, strDescription, isUnread }, navigateTo) {
    return {
        strDate,
        strTime,
        isUnread,
        strDescription,
        handleClick: console.log
    }
}

function* generateList({ strDate }, records, navigateTo) {
    for(let [strTime, value] of records) {
        yield makeCell({
            strDate,
            strTime,
            strDescription: value.description,
            isUnread: value.unread || false
        }, navigateTo)
    }
}

function makeList({ strDate }, view, navigateTo) {
    let records = new Map(view.get(strDate))
    /** TODO:
     * SORT THIS LIST
     */
    if(records.size) {
        return {
            appointments: generateList({ strDate }, records, navigateTo)
        }
    } else {
        return {
            appointments: undefined
        }
    }
}


function AppointmentDayList() {
    this.__templates = {
        main: compile(document.getElementById("day-appointments_main").innerText),
        list: compile(document.getElementById("day-appointments_list").innerText)
    }
}
AppointmentDayList.prototype = {
    paint: async function({ strDate }) {
        let { view } = await this.state

        this.__templates.main(
            this.anchorElement,
            {
                strDate,
                handleClick: () => void this.navigateTo({
                    url: '/calendar/mutate/',
                    parameters: {
                        preferredDate: strDate,
                        allowCancel: false
                    }
                })
            }
        ).next()

        this.__templates.list(
            this.anchorElement.querySelector("*[data-id=day-appointments_list]"),
            makeList({
                strDate
            }, view, this.navigateTo)
        ).next()

    }
}


export { AppointmentDayList }