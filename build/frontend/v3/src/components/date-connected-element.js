import { backend } from '../backend'


export default class DateConnectedElement extends HTMLElement {
    /*
    static get observedAttributes() { return [
        'data-strdate',
        'data-todaydate',
        'data-strtime'
    ]; }
    */
    _DateConnectedElement__listener = () => this.repaint();
    constructor() { super(); }
    
    connectedCallback() {
        window.addEventListener("app-calendar", this._DateConnectedElement__listener)
        this.repaint()
    }
    
    disconnectedCallback() {
        window.removeEventListener("app-calendar", this._DateConnectedElement__listener)
    }
    
    attributeChangedCallback(attribute, previousValue, newValue) {
        switch(attribute) {
            case "data-strdate":
                this.repaint({ strDate: newValue });
                break
            case "data-strtime":
                this.repaint({ strTime: newValue });
                break
            case "data-todaydate":
                this.repaint({ todayDate: newValue });
                break
        }
    }
    
    repaintAttributes(_) {
        let { strDate, todayDate, strTime } = _ || {}
        return {
            strDate: strDate || this.getAttribute("data-strdate"),
            strTime: strTime || this.getAttribute("data-strtime"),
            todayDate: todayDate || this.getAttribute("data-todaydate")
        }
    }
    
    repaint(_) {
        this._repaint(
            this.repaintAttributes(_),
            backend.state
        )
    }
    
    _repaint(any, { view, newEvents }) {
        throw "Subclass should overwrite the _repaint(any, { view, newEvents }) method"
    }
}