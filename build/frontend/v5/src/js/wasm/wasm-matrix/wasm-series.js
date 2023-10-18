class Series {
    constructor(data) {
        this.__data = data;
        this[Symbol.iterator] = () => this.__data[Symbol.iterator]();
    }

    get size() {
        return this.__data.length;
    }

    get(index) {
        return this.__data[index];
    }

    set(index, value) {
        if(index < this.size && 0 <= index)
            {this.__data[index] = value;}
    }

    slice(startInclusive, endExclusive) {
        return new ReadonlySeries(this.__data.slice(startInclusive, endExclusive));
    }

    push(value) {
        this.__data.push(value);
    }
}


class ReadonlySeries extends Series {
    constructor(data) {
        super(data);
    }

    set() {
        throw "Readonly Series cannot be updated";
    }

    push() {
        throw "Readonly Series cannot be updated";
    }
}


class SeriesDynamicMemory {
    constructor() {
        this.__series = new Map();
    }
    
    getSeries(seriesPointer) {
        return this.__series.get(seriesPointer);
    }

    createBlanksSeries(size) {
        return this._createSeries([...Array(size)].map(() => ""));
    }

    createZerosSeries(size) {
        return this._createSeries([...Array(size)].map(() => 0));
    }

    _createSeries(data, options) {
        const readOnly = options && options.readOnly;
        const series = new (readOnly ? ReadonlySeries : Series)(data);

        let index = 0;
        do {
            index += 1;
        } while(this.__series.has(index));
        this.__series.set(index, series);
        return index;
    }

    clear() {
        this.__series.clear();
    }
}


export { SeriesDynamicMemory };
