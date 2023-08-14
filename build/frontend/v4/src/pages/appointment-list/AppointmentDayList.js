
import { compile } from '../../template-engine.js'
import { AppointmentList } from './AppointmentList.js'


function* generateEntries(source, strDate) {
    for(let [strTime, record] of source) {
        yield {
            strDate,
            strTime,
            strDescription: record.description,
            markUnread: record.unread || false
        }
    }
}


function AppointmentDayList() {
    this.__templates = compile(document.getElementById("day-appointments_main").innerText)
    this.__listHandler = new AppointmentList()
}
AppointmentDayList.prototype = {
    paint: async function({ strDate }) {
        let { view } = await this.state

        let source = view.get(strDate)
        let hasAppointments = source && source.size

        this.__templates(
            this.anchorElement,
            {
                strDate,
                handleClick: () => void this.navigateTo({
                    url: '/calendar/mutate/create',
                    parameters: {
                        preferredDate: strDate
                    }
                }),
                hasAppointments
            }
        ).next()

        if(hasAppointments) {
            this.__listHandler.hydrate(this, generateEntries(source, strDate))
        }

    }
}


export { AppointmentDayList }