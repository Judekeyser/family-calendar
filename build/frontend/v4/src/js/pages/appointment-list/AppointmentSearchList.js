import { SearchEngine } from '../../search-engine.js';
import {
    forgeTemplateScope, forgeData
} from '../../components/appointments-list/AbstractAppointmentsList.js';
import { MonadicIteratorMap } from '../../algebra/MonadicIteratorMap.js';


const TEMPLATE_ID = "appointments-search_main";

function AppointmentSearchList() {}
AppointmentSearchList.prototype = {
    paint: async function({ defaultSearchQuery }) {
        const { view } = await this.state;

        const searchEngine = new SearchEngine();
        for(const [strDate, timeMap] of view) {
            for(const [strTime, record] of timeMap) {
                searchEngine.acceptAppointment({
                    strDate, strTime,
                    strDescription: record.description
                });
            }
        }

        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);
        const self = this;
        this.getTemplate(TEMPLATE_ID)(
            this.anchorElement,
            {
                handleSubmit: function(e) {
                    e.preventDefault();
                    const button = this.querySelector("button");
                    const searchQuery = this.search.value || '';
                    if(searchQuery) {
                        button.disabled = true;
                        try {
                            const searchResult = searchEngine.search(
                                { maximalCount: 10, searchQuery, past: false }
                            );
                            
                            const templateData = (
                                new MonadicIteratorMap().map(
                                    ({ date, time }) => forgeData({
                                        strDate: date,
                                        strTime: time,
                                        eventData: (
                                            new Map(view.get(date)).get(time)
                                        )
                                    }, self.navigateTo)
                                )
                            ).apply(searchResult);
                
                            self.getTemplate("appointment_list")(
                                self.anchorElement.querySelector(
                                    "*[data-id=appointments_list]"
                                ),
                                forgeTemplateScope(
                                    templateData,
                                    { sorted: true }
                                ),
                                "1"
                            );
                        } finally {
                            button.disabled = false;
                        }
                    }
                },
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
            },
            "0"
        );

    }
};


export { AppointmentSearchList };
