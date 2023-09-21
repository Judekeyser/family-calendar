class Series {
    #data;

    constructor(data) {
        this.#data = data;
    }

    get size() {
        return this.#data.length;
    }

    get(index) {
        return this.#data[index];
    }

    set(index, value) {
        if(index < this.size && 0 <= index)
            this.#data[index] = value;
    }

    push(value) {
        this.#data.push(value);
    }
}


class DynamicMemory {
    #series;

    constructor() {
        this.#series = new Map();
    }
    
    getSeries(seriesPointer) {
        return this.#series.get(seriesPointer);
    }

    createEmptySeries() {
        let index = 0;
        do {
            index += 1;
        } while(this.#series.has(index));

        this.#series.set(index, new Series([]));
        return index;
    }

    disposeSeries(seriesPointer) {
        this.#series.delete(seriesPointer);
    }
}


export { DynamicMemory, Series };
