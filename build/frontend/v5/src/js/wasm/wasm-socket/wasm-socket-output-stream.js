import { templateMap } from "../../templates/template";


function decodeTemplateEmission(emission) {
    if(emission) {
        if(emission.startsWith("E_SL:")) {
            emission = emission.substring("E_SL:".length);
            const templateIdentifier = emission.substring(0, emission.indexOf(":"));
            const sliceIdentifier = parseInt(emission.substring(templateIdentifier.length + 1));

            const slice = templateMap.get(templateIdentifier)?.get(sliceIdentifier);

            if(slice != null) {
                return slice;
            } else {
                console.warn(`Unresolved slice ${sliceIdentifier} for template ${templateIdentifier}`);
            }
        } else if(emission.startsWith("E_ID:")) {
            emission = emission.substring("E_ID:".length);
            return ` data-uuid="${emission}" `
        } else if(emission.startsWith("E_ATTR:")) {
            emission = emission.substring("E_ATTR:".length);
            const [elementUuid, attribute, value] = emission.split(":");
            if(elementUuid && attribute) {
                return {
                    elementUuid,
                    effect: _ => value ? _.setAttribute(attribute, value) : _.removeAttribute(attribute)
                }
            }
        } else if(emission.startsWith("E_CLS:")) {
            emission = emission.substring("E_CLS:".length);
            const [elementUuid, value] = emission.split(":");
            if(elementUuid && value) {
                return {
                    elementUuid,
                    effect: _ => _.classList.add(value)
                }
            }
        } else {
            return emission;
        }
    }
    return undefined;
}


class WasmSocketOutputStream
{
    // Accept lines from WASM to JavaScript
    #effects;
    #lines;
    #template;

    constructor() {
        this.#effects = new Map();
        this.#lines = [];
        this.#template = "";
    }

    #flush() {
        this.#template += this.#lines.join("");
        this.#lines = [];
    }

    accept = someLine => {
        const templateSlice = decodeTemplateEmission(someLine);
        if(templateSlice != null) {
            if(typeof templateSlice === 'string') {
                this.#lines.push(templateSlice);
                if(this.#lines.length > 16) {
                    this.#flush();
                }
            } else {
                const { elementUuid, effect } = templateSlice;
                if(!this.#effects.has(elementUuid)) {
                    this.#effects.set(elementUuid, []);
                }
                this.#effects.get(elementUuid).push(effect);
            }
        }
    }

    get output() {
        this.#flush();

        const effectPlayer = anchorElement => {
            for(const elementUuid of this.#effects.keys()) {
                const targetElement = anchorElement.querySelector(`*[data-uuid=${elementUuid}]`);
                for(const effect of this.#effects.get(elementUuid)) {
                    effect(targetElement);
                }
            }
        }

        return { template: this.#template, effectPlayer };
    }
}


export { WasmSocketOutputStream };