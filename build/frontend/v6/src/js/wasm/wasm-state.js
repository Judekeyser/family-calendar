import { backend } from "../backend/backend-store";


class WasmState {
    constructor() {
        this.__backendState = {};
    }

    async prepare_view() {
        console.log("Computing Calendar view");
        let success, failure;
        try {
            success = await backend.state;
        } catch(error) {
            console.error(error);
            const { errorCode, errorMessage } = error;
            if(errorCode == 401 || errorCode == 403) {
                failure = {
                    errorCode,
                    errorMessage
                };
            } else {
                failure = {
                    errorCode: 500,
                    errorMessage: "Erreur inconnue"
                };
            }
        }
        this.__backendState = { success, failure, dependentObjects: new Map() };
        return success ? 1 : 0;
    }

    get_times(date) {
        try {
            const timeMap = this.__backendState.success.get(date);
            const times = {
                sequence: timeMap ? [...timeMap.keys()] : [],
                data: timeMap,
                cursor: 0,
                next: function() {
                    if(this.cursor < this.data.length) {
                        times.cursor += 1;
                        return 1;
                    } else {
                        return 0;
                    }
                }
            };
            return this.registerObject(times);
        } catch(error) {
            console.error(error);
            return 0;
        }
    }

    /** Private members */

    registerObject(any) {
        const dependentObjects = this.__backendState.dependentObjects;
        for(let i = 1; i < 500; i++) {
            if(dependentObjects.has(i)) {
                continue;
            } else {
                dependentObjects.set(i, any);
                return i;
            }
        }
        throw "Unable to set more than 500 objects in memory";
    }
}


export { WasmState };