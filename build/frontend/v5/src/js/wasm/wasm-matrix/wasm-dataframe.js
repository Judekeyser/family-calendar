class Dataframe {
    constructor() {
        this.__gridData = new Map();
        this.__columnNames = [];
    }

    getColumnAtIndex(columnIndex) {
        const columnName = this.__columnNames[columnIndex];
        return this.__gridData.get(columnName);
    }

    appendColumn(columnName, data) {
        const columnIndex = this.__columnNames.length;
        this.__columnNames.push(columnName);
        this.__gridData.set(columnName, data);
        return columnIndex;
    }

    reindex(columnIndex) {
        const column = this.getColumnAtIndex(columnIndex);

        let rearrangement = [];

        {
            const valueToIndices = new Map();
            {
                let i = 0;
                for(const value of column) {
                    const mutableArray = valueToIndices.get(value);
                    if(mutableArray == null) {
                        valueToIndices.set(value, [i]);
                    } else {
                        mutableArray.push(i);
                    }
                    i += 1;
                }
            }
            {
                const sortedValues = [...valueToIndices.keys()].sort();
                for(const value of sortedValues) {
                    rearrangement = rearrangement.concat(valueToIndices.get(value));
                }
            }
        }

        const reindexedDataframe = new Dataframe();
        for(let i = 0; i < this.__columnNames.length; i++) {
            const columnName = this.__columnNames[i];
            const column = this.getColumnAtIndex(i);

            reindexedDataframe.appendColumn(
                columnName,
                rearrangement.map(j => column[j])
            );
        }

        return reindexedDataframe;
    }

    selectWithIsIn(columnIndex, dataIterable) {
        const whiteList = new Map(
            [...dataIterable].map((v,i) => ([v, i]))
        );
        let indices = []; {
            let i = 0;
            for(const value of this.getColumnAtIndex(columnIndex)) {
                if(whiteList.has(value)) {
                    indices.push(i);
                }
                i += 1;
            }
        }

        const nextArrayDf = new Dataframe();
        for(let i = 0; i < this.__columnNames.length; i++) {
            const newCol = [];
            const col = this.getColumnAtIndex(i);
            for(const index of indices) {
                newCol.push(col[index]);
            }
            if(i == columnIndex) {
                for(let j = 0; j < newCol.length; j++) {
                    const cell = whiteList.get(newCol[j]);
                    if(cell == null) {
                        console.error("Look-up yielded null, but it shouldn't", newCol[j]);
                        newCol[j] = -1;
                    } else {
                        newCol[j] = cell;
                    }
                }
            }
            nextArrayDf.appendColumn(this.__columnNames[i], newCol);
        }

        return nextArrayDf;
    }

    get columnNames() {
        return [...this.__columnNames];
    }
}


function df(store) {
    const df = new Dataframe();
    const columns = {
        "strdate": [],
        "strtime": [],
        "unread": [],
        "isDayOff": [],
        "description": [],
        "detail": []
    };

    for(const [strdate, timeMap] of store.entries()) {
        for(const [strtime, { unread, isDayOff, description, detail }] of timeMap.entries()) {
            columns["strdate"].push(strdate);
            columns["strtime"].push(strtime);
            columns["unread"].push(unread ? 1 : 0);
            columns["isDayOff"].push(isDayOff ? 1 : 0);
            columns["description"].push(description || "");
            columns["detail"].push(detail || "");
        }
    }

    for(const [columnName, data] of Object.entries(columns)) {
        df.appendColumn(columnName, data);
    }

    return df;
}


class DataframeDynamicMemory {
    constructor(seriesMemory) {
        this.__seriesMemory = seriesMemory;
        this.__dataframes = new Map();
    }

    appendColumn(dataframePointer, columnName, seriesPointer) {
        const dataframe = this.__dataframes.get(dataframePointer);
        const series = this.__seriesMemory.getSeries(seriesPointer);
        return dataframe.appendColumn(columnName, [...series]);
    }

    getColumnAtIndex(dataframePointer, columnIndex) {
        const dataframe = this.__dataframes.get(dataframePointer);
        const seriesPtr = this.__seriesMemory._createSeries(
            dataframe.getColumnAtIndex(columnIndex),
            { readOnly: true }
        );
        return seriesPtr;
    }

    selectWithIsIn(dataframePointer, columnIndex, seriesPointer) {
        const dataframe = this.__dataframes.get(dataframePointer);
        const series = this.__seriesMemory.getSeries(seriesPointer);
        const subDataframe = dataframe.selectWithIsIn(columnIndex, series);

        return this._registerDataframe(subDataframe);
    }

    reindex(dataframePointer, columnIndex) {
        const dataframe = this.__dataframes.get(dataframePointer);
        const reindexed = dataframe.reindex(columnIndex);
        return this._registerDataframe(reindexed);
    }

    createEmptyDataframe() {
        return this._registerDataframe(new Dataframe());
    }

    _registerDataframe(dataframe) {
        let index = 0;
        do {
            index += 1;
        } while(this.__dataframes.has(index));

        this.__dataframes.set(index, dataframe);
        return index;
    }

    clear(baseStore) {
        this.__dataframes.clear();
        this.__dataframes.set(0, df(baseStore));
    }
}


export { DataframeDynamicMemory };
