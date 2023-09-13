/**
 * @template {*} T
 * @template {*} G
 * @callback SimpleMapping
 * @param {T} value
 * @returns {G}
 */


/**
 * @template {*} T
 * @template {*} G
 */
class LiftIterator {
    /**
     * @param {Iterable<T>} sourceIterable 
     * @param {SimpleMapping.<T, Iterable<G>>} f
     */
    constructor(sourceIterable, f) {
        this.sourceIterable = sourceIterable[Symbol.iterator]();
        this.f = f;
        /**
         * @type {Iterator<G,any> | undefined}
         */
        this._current = undefined;
    }

    /**
     * @returns {IteratorResult<G, *>}
     */
    next = () => {
        for(let i = 0;i < 500;i++) {
            if(!this._current) {
                const {done, value} = this.sourceIterable.next();
                if(done) {
                    return {
                        done: true,
                        value: undefined
                    };
                } else {
                    this._current = this.f(value)[Symbol.iterator]();
                    if(!this._current) {
                        throw "Undefined result of iterator";
                    }
                }
            } else {
                const { done, value } = this._current.next();
                if(done) {
                    this._current = undefined;
                } else {
                    return {
                        done: false,
                        value
                    };
                }
            }
        }
        throw "Acquiring next iterator failed after 500 iterations...";
    };

    [Symbol.iterator] = () => this;
}


/**
 * @template {*} T
 * @template {*} G
 * @param {SimpleMapping.<T,Iterable<G>>} f
 * @returns {SimpleMapping<Iterable<T>, Iterable<G>>}
 */
function lift(f) {
    /**
     * @param {Iterable<T>} value
     * @returns {Iterable<G>}
     */
    return value => new LiftIterator(value, f);
}

/**
 * @template {unknown} U
 * @template {unknown} V
 */
class MonadicIteratorMap {
    /**
     * @typedef {SimpleMapping.<*, Iterable<*>>} KleisliArrow
     */
    constructor() {
        /**
         * @type {Array.<KleisliArrow>} 
         */
        this.functionStack = [];
    }

    /**
     * @template {unknown} W
     * @param {SimpleMapping.<V, W>} f
     * @returns {MonadicIteratorMap.<U, W>}
     */
    map(f) {
        /**
         * @type {KleisliArrow}
         */
        const arrow = x => [f(x)];
        
        return (
            /**
             * @type {MonadicIteratorMap.<U, W>}
             */ (new MonadicIteratorMap())
        ).#withMarkers(...this.functionStack, arrow);
    }

    /**
     * @template {unknown} W
     * @param {SimpleMapping.<V, Iterable<W>>} f
     * @returns {MonadicIteratorMap.<U, W>}
     */
    flatMap(f) {
        /**
         * @type {KleisliArrow}
         */
        const arrow = f;
        
        return (
            /**
             * @type {MonadicIteratorMap.<U, W>}
             */ (new MonadicIteratorMap())
        ).#withMarkers(...this.functionStack, arrow);
    }

    /**
     * @template {unknown} W
     * @param {SimpleMapping.<V, boolean>} f
     * @returns {MonadicIteratorMap.<U, W>}
     */
    filter(f) {
        /**
         * @type {KleisliArrow}
         */
        const arrow = x => f(x) ? [x] : [];
        
        return (
            /**
             * @type {MonadicIteratorMap.<U, W>}
             */ (new MonadicIteratorMap())
        ).#withMarkers(...this.functionStack, arrow);
    }

    debug() {
        return this.filter(_ => {
            console.log(_);
            return true;
        });
    }

    /**
     * @param {Iterable<U>} sourceIterable
     * @returns {Iterable<V>}
     */
    apply(sourceIterable) {
        /**
         * @type {Iterable<unknown>}
         */
        let resultIterable = sourceIterable;
        for(const arrow of this.functionStack) {
            resultIterable = lift(arrow)(resultIterable);
        }
        
        return (
            /**
             * @type {Iterable<V>}
             */ (resultIterable)
        );
    }

    /**
     * @param  {...KleisliArrow} fs
     */
    #withMarkers(...fs) {
        this.functionStack = fs;
        return this;
    }
}


export { MonadicIteratorMap };

