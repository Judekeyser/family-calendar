import { EventEmitter } from './event-emitter'

/** Router API

Router instances listen to `hashchange` and `load` events
of global object, and re-send an event on `app-route` with detail as
the URL segment:

Example:
--------
    #aWRlbnRpZmljYXRpb24%3D ~ ['identification'] ~ /identification
*/

function Router() {
    EventEmitter.call(this, Router._EventEmitter__Router);
    
    this._Router__state = undefined;
    
    window.addEventListener("popstate", ev => void this._Router__handleHashChange(ev.state))
    setTimeout(() => void this._Router__handleHashChange())
}
Router._EventEmitter__Router = {
    channel: "app-route"
}
Router.prototype =
{
    _Router__handleHashChange: function(state) {
        if(!state) {
            try {
                let hash = window.location.hash
                if(!hash) {
                    state = []
                } else {
                    state = (decodeURIComponent(hash.substring(1))).split(";")
                }
            } catch(e) { state = [] }
        }
        this._Router__state = state
        return this._emitEvents({ route: state })
    },
    
    /** Exposed getters */
    
    get goTo() {
        return (function(state) {
            let currentState = this._Router__state;
            redirect: {
                guard: {
                    if(currentState) {
                        if(currentState.length === state.length) {
                            for(let i = 0; i < state.length; i++) {
                                if(currentState[i] !== state[i])
                                    break guard;
                            }
                            break redirect;
                        }
                    }
                }
                
                let hash = encodeURIComponent((state.join(";")))
                window.history.pushState(state, '', '#'+hash)
                this._Router__handleHashChange(state);
                return true;
            }
            return false;
        }).bind(this)
    },
    get back() {
        return (function() {
            window.history.back()
        }).bind(this)
    },
    
    get resend() {
        return (function() {
            this._Router__handleHashChange();
        }).bind(this)
    }
}
Object.setPrototypeOf(Router.prototype, EventEmitter.prototype);


const router = new Router();

export { router }