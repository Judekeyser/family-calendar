const encoder = new TextEncoder();
const decoder = new TextDecoder();

function UTF8ToString(byteArray) {
    let size = 0;
    for(const byte of byteArray) {
        size += 1;
        if(!byte) {break;}
    }
    const slice = byteArray.subarray(0, size-1);
    return decoder.decode(slice);
}

function stringToUTF8Slice(jsMessage, buffer) {
    if(jsMessage != null) {
        const slice = encoder.encode(jsMessage);
        const utf8Length = slice.byteLength + 1;
        if(buffer.byteLength >= utf8Length) {
            buffer.set(slice);
            buffer[slice.byteLength] = 0;
            return utf8Length;
        }
    }
    return 0;
}


class WasmRuntime {
    constructor(memoryBuffer, seriesDynamicMemory, dataframeDynamicMemory) {
        this.__memoryBuffer = memoryBuffer;
        this.__seriesDynamicMemory = seriesDynamicMemory;
        this.__dataframeDynamicMemory = dataframeDynamicMemory;
    }

    set wasmSocket(value) {
        this.__wasmSocket = value;
    }

    get wasmSocket() {
        return this.__wasmSocket;
    }

    app_throw_error(stringPointer) {
        const startSlice = this.__memoryBuffer.subarray(stringPointer);
        const jsString = UTF8ToString(startSlice);
        throw new WebAssembly.RuntimeError(jsString);
    }

    app_log(stringPointer) {
        const startSlice = this.__memoryBuffer.subarray(stringPointer);
        const jsString = UTF8ToString(startSlice);
        console.log(jsString);
    }

    app_read_from_socket(writePtr, capacity) {
        try {
            const jsMessage = this.wasmSocket.read();
            return stringToUTF8Slice(
                jsMessage,
                this.__memoryBuffer.subarray(writePtr, writePtr+capacity)
            );
        } catch(error) {console.error(error);}
        return 0;
    }

    app_write_to_socket(readPtr) {
        try {
            const startSlice = this.__memoryBuffer.subarray(readPtr);
            const jsString = UTF8ToString(startSlice);
            this.wasmSocket.write(jsString);
            return 1;
        } catch(error) {console.error(error);}
        return 0;
    }

    /** SERIES */

    app_series_blanks(size) {
        try {
            return this.__seriesDynamicMemory.createBlanksSeries(size);
        } catch(error) {console.error(error);}
        return 0;
    }

    app_series_zeros(size) {
        try {
            return this.__seriesDynamicMemory.createZerosSeries(size);
        } catch(error) {console.error(error);}
        return 0;
    }

    app_series_get_as_int(seriesPtr, index) {
        try {
            const series = this.__seriesDynamicMemory.getSeries(seriesPtr);
            return series.get(index);
        } catch(error) {console.error(error);}
        return 0;
    }

    app_series_get_as_string(seriesPtr, index, targetPointer, capacity) {
        try {
            const series = this.__seriesDynamicMemory.getSeries(seriesPtr);
            const jsString = series.get(index);

            const result = stringToUTF8Slice(
                jsString,
                this.__memoryBuffer.subarray(targetPointer, targetPointer+capacity)
            );
            return result;
        } catch(error) {console.error(error);}
        return 0;
    }

    app_series_set_int(seriesPtr, index, value) {
        try {
            const series = this.__seriesDynamicMemory.getSeries(seriesPtr);
            series.set(index, value);
        } catch(error) {console.error(error);}
    }

    app_series_set_string(seriesPtr, index, stringPointer) {
        try {
            const series = this.__seriesDynamicMemory.getSeries(seriesPtr);
            const stringValue = UTF8ToString(this.__memoryBuffer.subarray(stringPointer));
            series.set(index, stringValue);
        } catch(error) {console.error(error);}
    }

    app_series_push_int(seriesPtr, value) {
        try {
            const series = this.__seriesDynamicMemory.getSeries(seriesPtr);
            series.push(value);
        } catch(error) {console.error(error);}
    }

    app_series_push_string(seriesPtr, stringPointer) {
        try {
            const series = this.__seriesDynamicMemory.getSeries(seriesPtr);
            const stringValue = UTF8ToString(this.__memoryBuffer.subarray(stringPointer));
            series.push(stringValue);
        } catch(error) {console.error(error);}
    }

    app_series_size(seriesPtr) {
        try {
            const series = this.__seriesDynamicMemory.getSeries(seriesPtr);
            return series.size;
        } catch(error) {console.error(error);}
        return -1;
    }

    /** DATAFRAMES */

    app_dataframe_create_empty() {
        try {
            const dfPointer = this.__dataframeDynamicMemory.createEmptyDataframe();
            return dfPointer;
        } catch(error) { console.error(error); }
        return 0;
    }

    app_dataframe_append_column(dataframePointer, stringPointer, seriesPointer) {
        try {
            const columnName = UTF8ToString(this.__memoryBuffer.subarray(stringPointer));
            return this.__dataframeDynamicMemory.appendColumn(dataframePointer, columnName, seriesPointer);
        } catch(error) { console.error(error); }
    }

    app_get_column_at_index(dataframePointer, columnIndex) {
        try {
            return this.__dataframeDynamicMemory.getColumnAtIndex(dataframePointer, columnIndex);
        } catch(error) { console.error(error); }
        return 0;
    }

    app_select_with_isin(dataframePointer, columnIndex, seriesPointer) {
        try {
            return this.__dataframeDynamicMemory.selectWithIsIn(dataframePointer, columnIndex, seriesPointer);
        } catch(error) { console.error(error); }
        return 0;
    }

    app_dataframe_reindex(dataframePointer, columnIndex) {
        try {
            return this.__dataframeDynamicMemory.reindex(dataframePointer, columnIndex);
        } catch(error) { console.error(error); }
        return 0;
    }

    get imports() {
        const methods = [
            "app_throw_error",
            "app_log",
            "app_read_from_socket",
            "app_write_to_socket",
            "app_series_zeros",
            "app_series_blanks",
            "app_series_get_as_int",
            "app_series_get_as_string",
            "app_series_set_int",
            "app_series_set_string",
            "app_series_push_int",
            "app_series_push_string",
            "app_series_size",
            "app_dataframe_create_empty",
            "app_dataframe_append_column",
            "app_get_column_at_index",
            "app_select_with_isin",
            "app_dataframe_reindex"
        ];
        return Object.freeze(Object.fromEntries(methods.map(
            name => ([name, this[name].bind(this)])
        )));
    }
}


export { WasmRuntime };