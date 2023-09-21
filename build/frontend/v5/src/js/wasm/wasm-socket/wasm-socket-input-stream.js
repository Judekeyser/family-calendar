class WasmSocketInputStream
{
    // Stream from JavaScript to WASM
    #state;
    #preamble;
    #queryParamsIterator;

    constructor(preamble, queryParametersIterator) {
        this.#state = 0;
        this.#preamble = preamble;
        this.#queryParamsIterator = queryParametersIterator;
    }

    next = () => {
        if(this.#state) {
            const { done, value } = this.#queryParamsIterator.next();
            if(done) {
                return { done, value };
            } else {
                const { key, parameter } = value;
                return {
                    done: false,
                    value: `${key}:${parameter}`
                };
            }
        } else {
            this.#state = 1;
            return {
                done: false,
                value: this.#preamble
            };
        }
    };
}


export { WasmSocketInputStream };