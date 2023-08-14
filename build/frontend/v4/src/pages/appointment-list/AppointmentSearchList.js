import { compile } from '../../template-engine.js'
import { SearchEngine } from '../../search-engine.js'
import { AppointmentList } from './AppointmentList.js'


function* generateEntries(searchResult, view) {
    for(let { key } of searchResult) {
        let strDate = key.substring(0, key.indexOf(' '))
        let strTime = key.substring(strDate.length + 1)
        let { unread, description } = view.get(strDate).get(strTime)
        yield {
            strDate, strTime,
            strDescription :description,
            markUnread: unread
        }
    }
}


function AppointmentSearchList() {
    this.__templates = compile(document.getElementById("appointments-search_main").innerText)
    this.__listHandler = new AppointmentList()
}
AppointmentSearchList.prototype = {
    paint: async function({ defaultSearchQuery }) {
        let { view } = await this.state
        let searchEngine = new SearchEngine()
        for(let [strDate, timeMap] of view) {
            for(let [strTime, record] of timeMap) {
                searchEngine.acceptAppointment({
                    strDate, strTime,
                    strDescription: record.description
                })
            }
        }

        this.__templates(
            this.anchorElement,
            {
                handleSubmit: ((self) => function(e) {
                    e.preventDefault()
                    let button = this.querySelector("button")
                    let searchQuery = this.search.value || ''
                    if(searchQuery) {
                        button.disabled = true
                        try {
                            let searchResult = searchEngine.search({ maximalCount: 7, searchQuery })
                            self.__listHandler.hydrate(self, generateEntries(searchResult, view), { sort: false })
                        } finally {
                            button.disabled = false
                        }
                    }
                })(this),
                hasAppointments: false,
                defaultSearchQuery
            }
        ).next()

    }
}


export { AppointmentSearchList }