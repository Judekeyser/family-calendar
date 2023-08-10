import { backend } from './backend.js'
import { dateTimeToString } from './date-utils.js';

import './components/LongFrenchDate.js'
import './components/LongFrenchTime.js'
import './components/DayTwoDigits.js'
import './components/MonthTwoDigits.js'

import { CalendarGridStartegy } from './pages/CalendarGridStrategy.js';
import { AppointmentDayList, UnreadAppointmentList } from './pages/AppointmentList.js';
import { CalendarMutationCreatePage, CalendarMutationModifyPage } from './pages/CalendarMutationPage.js';
import { AuthenticationPage } from './pages/AuthenticationPage.js';


customElements.define("app-route-listener", class extends HTMLElement {
    constructor() {
        super();
    }
    
    connectedCallback() {
        window.addEventListener("popstate", e => this.handleHistoryChange({ state: e.state }))
        window.addEventListener("app-navigate", ({ detail }) => this.handleNavigation(detail))

        ;(async () => {
            await __READY__

            this.__URLS = new Map([
                ['/calendar-grid/', new CalendarGridStartegy()],
                ['/appointments/day/', new AppointmentDayList()],
                ['/appointments/unread/', new UnreadAppointmentList()],
                ['/calendar/mutate/create', new CalendarMutationCreatePage()],
                ['/calendar/mutate/modify', new CalendarMutationModifyPage()],
                ['/authentication/', new AuthenticationPage()]
            ])

            this.handleHistoryChange({})
        })()
    }
    
    handleHistoryChange({ state, hash }) {
        if(state) {
            this.handleNavigation(state)
        } else if(hash == null) {
            hash = location.hash.substring(1)
            try {
                hash = atob(hash)
            } catch(error) {
                hash = ''
            }
            return this.handleHistoryChange({ hash })
        } else {
            let url = hash.substring(0, hash.indexOf('?'))
            let queryParser = new URLSearchParams(hash.substring(url.length+1, hash.length))
            let parameters = Object.fromEntries(queryParser)
            this.handleHistoryChange({ state: { url, parameters } })
        }
    }

    handleNavigation({ url, parameters }) {
        console.log("NAVIGATION", url, parameters)
        navigate: {
            resolvedUrl: {
                if(!url) {
                    break resolvedUrl
                } else {
                    let strategy = this.__URLS.get(url)
                    if(!strategy) {
                        break resolvedUrl
                    } else {
                        if(url === '/authentication/') {
                            var patched = this.patchAuthenticationPrototype(strategy)
                        } else {
                            var patched = this.patchPrototype(strategy)
                        }
                        patched.paint(parameters)
                            .catch(console.error /* We silent the error here, because likely it is a auth error and the recovery is performed by routing */)
                        break navigate
                    }
                }
            }
            this.emitNavigation({
                url: '/calendar-grid/',
                parameters: {
                    numberOfWeeks: 5,
                    firstWeekIncludes: dateTimeToString(Date.now())
                }
            })
        }
    }

    emitNavigation({ url, parameters }) {
        dispatchEvent(new CustomEvent(
            "app-navigate",
            { detail : { url, parameters } }
        ))
    }

    handleAuthenticationError(anyAction) {
        return (async function() {
            try {
                return await anyAction(...arguments)
            } catch(error) {
                let { errorCode, errorMessage } = error
                if(errorCode === 401 || errorCode === 403 || errorCode === 429) {
                    this.emitNavigation({
                        url: '/authentication/',
                        parameters: {
                            errorMessage
                        }
                    })
                }
                throw error
            }
        }).bind(this)
    }

    patchPrototype(strategy) {
        let self = this
        let _backendAdapter = {
            get state() {
                return self.handleAuthenticationError(
                    () => backend.state
                )()
            },
        
            get authentify() {
                return self.handleAuthenticationError(
                    backend.authentify
                )
            },
        
            get createEvent() {
                return self.handleAuthenticationError(
                    backend.createEvent
                )
            },
            
            get cancelEvent() {
                return self.handleAuthenticationError(
                    backend.cancelEvent
                )
            },
            
            get editEvent() {
                return self.handleAuthenticationError(
                    backend.editEvent
                )
            },
            
            get markRead() {
                return self.handleAuthenticationError(
                    backend.markRead
                )
            },

            get navigateTo() {
                return function({ url, parameters }) {
                    {
                        let sp = new URLSearchParams()
                        for(let [key, value] of Object.entries(parameters)) {
                            sp.append(key, value)
                        }
                        let queryString = `${url}?${sp.toString()}`
                        history.pushState(
                            { url, parameters },
                            '', `#${btoa(queryString)}`
                        )
                    }
                    return self.emitNavigation({url, parameters })
                }
            },

            get anchorElement() {
                return document.getElementById("anchor-content")
            }
        }
        Object.setPrototypeOf(_backendAdapter, strategy)
        return _backendAdapter
    }

    patchAuthenticationPrototype(strategy) {
        let self = this
        let _backendAdapter = {
            get state() {
                throw "Property not available in Authentication process"
            },
        
            get authentify() {
                return backend.authentify
            },

            get authentifiedUser() {
                return backend.authentifiedUser
            },
        
            get createEvent() {
                throw "Property not available in Authentication process"
            },
            
            get cancelEvent() {
                throw "Property not available in Authentication process"
            },
            
            get editEvent() {
                throw "Property not available in Authentication process"
            },
            
            get markRead() {
                throw "Property not available in Authentication process"
            },

            get navigateTo() {
                return function({ url, parameters }) {
                    {
                        let sp = new URLSearchParams()
                        for(let [key, value] of Object.entries(parameters)) {
                            sp.append(key, value)
                        }
                        let queryString = `${url}?${sp.toString()}`
                        history.pushState(
                            { url, parameters },
                            '', `#${btoa(queryString)}`
                        )
                    }
                    return self.emitNavigation({url, parameters })
                }
            },

            get anchorElement() {
                return document.getElementById("anchor-content")
            }
        }
        Object.setPrototypeOf(_backendAdapter, strategy)
        return _backendAdapter
    }
    
})

window['__READY__'] = new Promise(res => {
    window.addEventListener("load", res)
})