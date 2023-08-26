import { safeCompileOnce } from '../../template-engine.js';
import { SearchEngine } from '../../search-engine.js';
import { AppointmentList } from './AppointmentList.js';


function* generateEntries(searchResult, view) {
    for(let { key } of searchResult) {
        let strDate = key.substring(0, key.indexOf(' '));
        let strTime = key.substring(strDate.length + 1);
        let {
            unread,
            description, details,
            isDayOff
        } = view.get(strDate).get(strTime);
        yield {
            strDate, strTime,
            strDescription :description,
            strDetails: details,
            markUnread: unread,
            isDayOff: isDayOff || false
        };
    }
}


const TEMPLATE_ID = "appointments-search_main";

function AppointmentSearchList() {
    this.__templates = safeCompileOnce(
        document.getElementById(TEMPLATE_ID).innerText
    );
    this.__listHandler = new AppointmentList();
}
AppointmentSearchList.prototype = {
    paint: async function({ defaultSearchQuery }) {
        let { view } = await this.state;
        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        let searchEngine = new SearchEngine();
        for(let [strDate, timeMap] of view) {
            for(let [strTime, record] of timeMap) {
                searchEngine.acceptAppointment({
                    strDate, strTime,
                    strDescription: record.description
                });
            }
        }

        this.__templates(
            this.anchorElement,
            {
                handleSubmit: ((self) => function(e) {
                    e.preventDefault();
                    let button = this.querySelector("button");
                    let searchQuery = this.search.value || '';
                    if(searchQuery) {
                        button.disabled = true;
                        try {
                            let searchResult = searchEngine.search(
                                { maximalCount: 10, searchQuery, past: false }
                            );
                            self.__listHandler.clear(self);
                            self.__listHandler.hydrate(
                                self,
                                generateEntries(searchResult, view)
                            );
                        } finally {
                            button.disabled = false;
                        }
                    }
                })(this),
                hasAppointments: false,
                defaultSearchQuery,
                menu: {
                    back: {
                        handleClick: () => void this.navigateTo({
                            url: '/calendar/grid',
                            parameters: {}
                        })
                    },
                }
            }
        );

    }
};


export { AppointmentSearchList };
