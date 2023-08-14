import { compile } from '../template-engine.js'
import { AppointmentList } from './AppointmentList.js'


function* unreadEntriesGenerator(newEvents, view) {
    for(let { strDate, strTime } of newEvents) {
        let strDescription = view.get(strDate).get(strTime)
        yield { strDate, strTime, strDescription }
    }
}


function UnreadAppointmentList() {
    this.__templates = compile(document.getElementById("unread-appointments_main").innerText)
    this.__listHandler = new AppointmentList()
}
UnreadAppointmentList.prototype = {
    paint: async function() {
        let { view, newEvents } = await this.state

        let hasAppointments = !!newEvents.length

        this.__templates(
            this.anchorElement,
            {
                handleClick: ((self) => async function() {
                    this.disabled = true
                    try {
                        await self.markRead()
                        history.back()
                    } finally {
                        this.disabled = false
                    }
                })(this),
                hasAppointments
            }
        ).next()

        if(hasAppointments) {
            this.__listHandler.hydrate(this, unreadEntriesGenerator(newEvents, view))
        }

    }
}


export { UnreadAppointmentList }