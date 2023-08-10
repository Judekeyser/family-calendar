import { compile } from '../template-engine.js'
import { recordSorting } from '../date-utils.js'


function* generateList(records, navigateTo) {
    let sortedRecords = [...records].sort(recordSorting)
    for(let { strDate, strTime, strDescription, markUnread } of sortedRecords) {
        yield {
            strDate,
            strTime,
            markUnread,
            strDescription,
            handleClick: () => {
                navigateTo({
                    url: '/calendar/mutate/modify',
                    parameters: {
                        preferredDate: strDate,
                        preferredTime: strTime
                    }
                })
            }
        }
    }
}

function AppointmentList() {
    this.__templates = compile(document.getElementById("appointments_list").innerText)
}
AppointmentList.prototype = {
    hydrate: async function(ctx, entriesGenerator) {
        let appointments = generateList(entriesGenerator, ctx.navigateTo)
        this.__templates(
            ctx.anchorElement.querySelector("*[data-id=appointments_list]"),
            { appointments }
        ).next()
    },
    clear: function(ctx) {
        ctx.anchorElement.querySelector("*[data-id=appointments_list]").innerHTML = ""
    }
}



function AppointmentDayList() {
    this.__templates = compile(document.getElementById("day-appointments_main").innerText)
    this.__listHandler = new AppointmentList()
}
AppointmentDayList.prototype = {
    paint: async function({ strDate }) {
        let { view } = await this.state

        let source = new Map(view.get(strDate))
        let hasAppointments = !!source.size

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
            function* generateEntries() {
                for(let [strTime, record] of source) {
                    yield {
                        strDate,
                        strTime,
                        strDescription: record.description,
                        markUnread: record.unread || false
                    }
                }
            }
            this.__listHandler.hydrate(this, generateEntries())
        }

    }
}


function UnreadAppointmentList() {
    this.__templates = compile(document.getElementById("unread-appointments_main").innerText)
    this.__listHandler = new AppointmentList()
}
UnreadAppointmentList.prototype = {
    paint: async function() {
        let { view } = await this.state

        function* unreadEntriesGenerator() {
            for(let [strDate, timeMap] of view) {
                for(let [strTime, record] of timeMap) {
                    if(record.unread) {
                        yield {
                            strDate,
                            strTime,
                            strDescription: record.description
                        }
                    }
                }
            }
        }

        let hasAppointments = (() => {
            for(let _ of unreadEntriesGenerator())
                return true
            return false
        })()


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
            this.__listHandler.hydrate(this, unreadEntriesGenerator())
        }

    }
}


export { AppointmentList, AppointmentDayList, UnreadAppointmentList }