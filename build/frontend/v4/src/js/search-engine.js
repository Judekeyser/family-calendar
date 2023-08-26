import { now } from "./date-utils";

/**
 * @template T - The `yield` type of the base iterator
 */
class BatchedIterator
{
    /**
     * @param {Iterator<T, *>} baseIterator 
     */
    constructor(baseIterator) {
        this.iterator = baseIterator;
        this.done = false;
    }

    /**
     * @returns {IteratorResult<Array<T>, null>} - An array of elements
     */
    next = () => {
        /**
         * @type {Array<T>}
         */
        const batch = [];
        if(!this.done) {
            for(let i = 0; i < 30; i++) {
                const { done, value } = this.iterator.next();
                if(!done) {
                    batch.push(value);
                } else {
                    break;
                }
            }
        }
        if(!batch.length) {
            this.done = true;
            return {
                done: true,
                value: null
            };
        } else {
            return {
                value: batch
            };
        }
    };

    [Symbol.iterator] = () => this;
}


/**
 * Extracts words from a text and uniformizes them.
 * 
 * Words are detected by finding consecutive sequences of alpha-numeric
 * characters. The uniformization goes through a diphtongue normalization
 * process, described above. A word will never be blank.
 * 
 * @param {string} strDescription - The text to extract words from
 * @returns {Set<string>} - The word-tokens
 * ----------------------------------------------------------------------------
 */
function extractTokens(strDescription) {
    /**
     * @type{Set<string>}
     */
    const tokens = new Set();
    for(const [match] of strDescription.matchAll(/\b\w+\b/ig)) {
        const uniformized = uniformizeDiphtongues(match);
        if(uniformized) {
            tokens.add(uniformized);
        }
    }
    return tokens;
}

/**
 * This type defines a substitution result. The first part of the tuple is the
 * text, that will be a suffix. The second part is the prefix.
 * 
 * @typedef {[string, string]} Extraction
 * ----------------------------------------------------------------------------
 * 
 * Elements of type `Extractor` are expected to return extractions, or nothing
 * if nothing might be extracted. The implementation is specific to each
 * extraction process, yet the common signature is described as:
 * 
 * @callback Extractor
 * @param {string} source - The source to extractor from
 * @returns {Extraction=} - The extraction result, or nothing.
 * ----------------------------------------------------------------------------
 */

/**
 * Extract the diphtongue out of the source, if the source starts with the
 * diphtongue. When it is not the case, the method returns undefined.
 * 
 * The method does not apply the replacement token, but happens it on the
 * result. This allows an easy pattern-matching with the `undefined` case.
 * 
 * @param {string} source - The source text to replace diphtongues in
 * @param {string} diphtongue - The diphtongue to target
 * @param {string} replacement - The replacement string
 * @returns {Extraction=} - A pair of strings
 * ----------------------------------------------------------------------------
 */
function substitute(source, diphtongue, replacement) {
    if(source.startsWith(diphtongue)) {
        return [source.slice(diphtongue.length), replacement];
    } else {
        return undefined;
    }
}


/**
 * Extracts the first diphtongue in the source, if found. This method follows
 * the same policy as @link {substitute}, except it applies the additional
 * condition that the next token after the diphtongue, is a vowel or the end
 * of the word.
 * 
 * @param {string} source - The source string to replace in
 * @param {string} diphtongue - The diphtongue to target
 * @param {string} replacement - The replacement token for the diphtongue
 * @returns {Extraction=}
 * ----------------------------------------------------------------------------
 */
function substitute_termination(source, diphtongue, replacement) {
    const length = diphtongue.length;
    const termination = diphtongue[length - 1];
    if (source.startsWith(diphtongue)) {
        substitute: {
            if(source.length > length) {
                const charAfterDiphtongue = (
                    /**
                     * @type {string} Not null by design
                     */ (source[length])
                );
                if(charAfterDiphtongue == termination
                    || "aeiouyh".includes(charAfterDiphtongue)
                ) {
                    break substitute;
                }
            }
            return [source.slice(length), replacement];
        }
    }
    return undefined;
}

/**
 * Apply transformers onto the source. This auxiliary method is used through the
 * uniformization process.
 * 
 * @param {string} source - The text source to apply the transformers onto
 * @param {Iterable<Extractor>} transformers - The transformers to be applied
 * @returns {string} - A text that is the transformed source
 * ----------------------------------------------------------------------------
 */
function applyTransformers(source, transformers) {
    /**
     * @type {Array<string>}
     */
    const target = [];
    
    let sourceCursor = source;
    while(sourceCursor.length) {
        applicative: {
            for(const transformer of transformers) {
                const transformed = transformer(sourceCursor);
                if(transformed) {
                    const [nextSource, newElements] = transformed;
                    for(const newElement of newElements) {
                        target.push(newElement);
                    }
                    sourceCursor = nextSource;
                    break applicative;
                }
            }
            const unprocessedLetter = (
                /**
                 * @type {string} Not null by design
                 */ (sourceCursor[0])
            );
            target.push(unprocessedLetter);
            sourceCursor = sourceCursor.slice(1);
        }
    }
    
    return target.join("");
}

/**
 * @type {Array<Extractor>}
 */
const clean_diphtongues_transformers = [
    source => { /* Handle C */
        if(source.startsWith('ch')) {
            return [source.slice(2), 'C'];
        } else if(source.startsWith('cc')) {
            return [source.slice(2), 'x'];
        } else if(source.startsWith('cq')) {
            return [source.slice(1), ''];
        } else if(source.startsWith('ci')) {
            return [source.slice(1), 's'];
        } else if(source.startsWith('ce')) {
            return [source.slice(1), 's'];
        } else if(source.startsWith('c')) {
            return [source.slice(1), 'k'];
        } else {
            return undefined;
        }
    },
    
    source => { /* Handle G */
        if(source.startsWith('gea')) {
            return [source.slice(2), 'j'];
        } else if(source.startsWith('geo')) {
            return [source.slice(2), 'j'];
        } else if(source.startsWith('gi')) {
            return [source.slice(1), 'j'];
        } else if(source.startsWith('gy')) {
            return [source.slice(1), 'j'];
        } else if(source.startsWith('ge')) {
            return [source.slice(1), 'j'];
        } else if(source.startsWith('gui')) {
            return [source.slice(2), 'g'];
        } else if(source.startsWith('guy')) {
            return [source.slice(2), 'g'];
        } else if(source.startsWith('gue')) {
            return [source.slice(2), 'g'];
        } else {
            return undefined;
        }
    },
    
    source => substitute(source, 'qu', 'k'),
    source => substitute(source, 'q', 'k'),
    source => substitute(source, 'ph', 'f'),
    source => substitute(source, 'ille', 'Y'),
    
    source => substitute_termination(source, 'on', 'O'),
    
    source => substitute_termination(source, 'ain', 'I'),
    source => substitute_termination(source, 'aim', 'I'),
    source => substitute(source, 'ai', 'e'),
    source => substitute_termination(source, 'an', 'A'),
    source => substitute_termination(source, 'am', 'A'),
    
    source => substitute_termination(source, 'ein', 'I'),
    source => substitute_termination(source, 'eim', 'I'),
    source => substitute(source, 'ei', 'e'),
    source => substitute_termination(source, 'en', 'A'),
    source => substitute_termination(source, 'em', 'A'),
    
    source => substitute_termination(source, 'in', 'I'),
    source => substitute_termination(source, 'im', 'I'),
    
    source => substitute(source, 'au', 'o'),
    source => substitute(source, 'eau', 'o'),
    source => substitute(source, 'eu', 'E'),
    source => substitute(source, 'ou', 'U'),
    
    source => substitute_termination(source, 'un', 'I'),
    source => substitute_termination(source, 'um', 'I'),
    
    source => substitute(source, 'y', 'i'),
];

/**
 * @type {Array<Extractor>}
 */
const phonem_simplification_transformers = [
    source => substitute(source, 'tiO', 'siO'),
    source => substitute(source, 'tiA', 'siA')
];

/**
 * @type {Array<Extractor>}
 */
const post_clean_transformers = [
    source => { /* Handle doubled letters */
        if(source.length > 1) {
            const firstLetter = source[0];
            if(firstLetter === source[1]) {
                return [source.slice(1), ''];
            }
        }
        return undefined;
    },
    
    source => substitute(source, 'h', '')
];

/**
 * List of stop words in French
 */
const StopWords = new Set([
    "au",
    "aux",
    "avec",
    "ce",
    "ces",
    "dans",
    "de",
    "des",
    "du",
    "elle",
    "en",
    "et",
    "eux",
    "il",
    "je",
    "la",
    "le",
    "leur",
    "lui",
    "ma",
    "mais",
    "me",
    "meme",
    "mes",
    "moi",
    "mon",
    "ne",
    "nos",
    "notre",
    "nous",
    "on",
    "ou",
    "par",
    "pas",
    "pour",
    "qu",
    "que",
    "qui",
    "sa",
    "se",
    "ses",
    "son",
    "sur",
    "ta",
    "te",
    "tes",
    "toi",
    "ton",
    "tu",
    "un",
    "une",
    "vos",
    "votre",
    "vous",
    "c",
    "d",
    "j",
    "l",
    "a",
    "m",
    "n",
    "s",
    "t",
    "y",
    "ete",
    "etee",
    "etees",
    "etes",
    "etant",
    "suis",
    "es",
    "est",
    "sommes",
    "etes",
    "sont",
    "serai",
    "seras",
    "sera",
    "serons",
    "serez",
    "seront",
    "serais",
    "serait",
    "serions",
    "seriez",
    "seraient",
    "etais",
    "etait",
    "etions",
    "etiez",
    "etaient",
    "fus",
    "fut",
    "fumes",
    "futes",
    "furent",
    "sois",
    "soit",
    "soyons",
    "soyez",
    "soient",
    "fusse",
    "fusses",
    "fut",
    "fussions",
    "fussiez",
    "fussent",
    "ayant",
    "eu",
    "eue",
    "eues",
    "eus",
    "ai",
    "as",
    "avons",
    "avez",
    "ont",
    "aurai",
    "auras",
    "aura",
    "aurons",
    "aurez",
    "auront",
    "aurais",
    "aurait",
    "aurions",
    "auriez",
    "auraient",
    "avais",
    "avait",
    "avions",
    "aviez",
    "avaient",
    "eut",
    "eumes",
    "eutes",
    "eurent",
    "aie",
    "aies",
    "ait",
    "ayons",
    "ayez",
    "aient",
    "eusse",
    "eusses",
    "eut",
    "eussions",
    "eussiez",
    "eussent",
    "ceci",
    "cela",
    "cet",
    "cette",
    "ici",
    "ils",
    "les",
    "leurs",
    "quel",
    "quels",
    "quelle",
    "quelles",
    "sans",
    "soi"
]);

/**
 * Uniformizes the word in input.
 * 
 * Uniformization means that diphtongues will be replaces with an equivalent
 * that makes more sense for comparing words. For examples, "Constantin"
 * will be uniformized as "KOstAtI", so that it will become closer to
 * phonetically close segments, like "Kostas".
 * 
 * When a word cannot be uniformizes (because it is too short, or is a
 * stop-word), nothing is returned.
 * 
 * @param {string} word - The word to uniformize
 * @returns {string=} A uniformized version of the word, or null.
 * ----------------------------------------------------------------------------
 */
function uniformizeDiphtongues(word) {
    const lcWord = word.toLocaleLowerCase();
    if(StopWords.has(lcWord)) {
        return undefined;
    } else if(lcWord == "eau") {
        return lcWord;
    } else {
        const wordWithoutSpecialChars = (
            lcWord.replaceAll("ç", "ss")
                .replaceAll("ï", "hi")
                .replaceAll("ë", "he")
                .replaceAll("ü", "hu")
                .replaceAll("ö", "ho")
                .replaceAll("ä", "ha")
                .normalize('NFKD')
                .replace(/[^\x20-\x7F]/g,"")
        );
        
        if(wordWithoutSpecialChars.length <= 1) {
            return undefined;
        } else {
            const transformedWord = applyTransformers(
                applyTransformers(
                    applyTransformers(wordWithoutSpecialChars,
                        clean_diphtongues_transformers
                    ),
                    phonem_simplification_transformers
                ),
                post_clean_transformers
            );
            return transformedWord.length <= 1 ? undefined: transformedWord;
        }
    }
}

/**
 * Computes the distance between two letters supposed to represent a
 * diphtongue. In the usual edition-distance algorithm (Levenshtein distance),
 * two letters distinct are always far by 1. We modify this policy, as some
 * letters might be closest to each others than one would expect.
 * 
 * The encoding of specific distance associations is done in `RELATED_LETTERS`.
 * 
 * Example:
 *  - The distance between "a" and "p" is 1
 *  - The distance between "a" and "A" is 0.3
 * 
 * @param {string} a - A letter, that represents a diphtongue
 * @param {string} b - A letter, that represents a diphtongue
 * @returns {number} The distance between the letters
 * ----------------------------------------------------------------------------
 */
function letterDistance(a, b) {
    if(a == b) {
        return 0;
    } else {
        switch(a+b) {
            case "oO": case "Oo":
            case "uO": case "Ou":
            case "aA": case "Aa":
            case "eA": case "Ae":
            case "eE": case "Ee":
            case "uE": case "Eu":
            case "iI": case "Ii":
            case "iy": case "yi":
            case "yI": case "Iy":
                return 0.3;
            case "vf": case "fv":
            case "bp": case "pb":
            case "td": case "dt":
            case "sz": case "zs":
                return 0.7;
            default:
                return 1;
        }
    }
}

/**
 * Recursive variation of the Levenshtein distance between two words.
 * 
 * Compared to the usual method, this implementation takes into account
 * specific distances between letters, to reflect more closely the idea of
 * diphtongues. The method also introduces a penalization factor, to short-
 * circuit faster in case the distances are too high.
 * 
 * The configuration does not change from one call to another.
 * It is used to allow a short-circuit by upper bound on the distance.
 * It also allows to consider the smallest word being a standard French
 * abbreviation of the longest. As such, the method is not symmetric.
 * We still call it "distance", for semantic reasons.
 * 
 * @param {string} a - The first word
 * @param {string} b - The second word
 * @param {{distance: number, penalization: number}} stack - Stack
 * @param {{x: string, y:string, upperBound: number}} config - Configuration
 * @returns {number}
 * ----------------------------------------------------------------------------
 */
function _recursiveLevenshtein(a, b, stack, config) {
    const { distance, penalization } = stack;
    const { x, y, upperBound } = config;

    if(distance > upperBound || penalization >= 3) {
        return Infinity;
    } else if(!a.length) {
        if(x.length >= 4 && distance <= 1 && x[0] == y[0]) {
            return distance; // Heuristic: French abbreviation
        } else {
            return distance + b.length;
        }
    } else if(!b.length) {
        return distance + a.length;
    } else if (a[0] === b[0]) {
        const nextStack=  {
            distance,
            penalization: penalization - 1
        };
        return _recursiveLevenshtein(
            a.slice(1), b.slice(1),
            nextStack, config
        );
    } else {
        const headA = (
            /**
             * @type {string}
             */ (a[0])
        );
        const headB = (
            /**
             * @type {string}
             */ (b[0])
        );
        const distanceBetweenLetters = letterDistance(headA, headB);
        const nextStack = {
            distance: distance + distanceBetweenLetters,
            penalization: penalization + distanceBetweenLetters >= 0.5 ? 1 : 0
        };
        return Math.min(
            _recursiveLevenshtein(a.slice(1), b.slice(1), nextStack, config),
            1.1 * _recursiveLevenshtein(a, b.slice(1), nextStack, config),
            1.1 * _recursiveLevenshtein(a.slice(1), b, nextStack, config),
        );
    }
}

/**
 * This is a public guard to Levenshtein distance. It ensures the first
 * parameter always has smaller length.
 * 
 * @param {string} x - First word
 * @param {string} y - Second word
 * @param {number} upperBound - Distance upper bound
 * @returns {number} - The distance between the words
 */
function levenshteinDistance(x, y, upperBound) {
    if (x.length > y.length) {
        return levenshteinDistance(y, x, upperBound);
    } else {
        const stack = {
            distance: 0,
            penalization: 0
        };
        const config = { x, y, upperBound };

        return _recursiveLevenshtein(x, y, stack, config);
    }
}


class SearchEngine {
    constructor() {
        /**
         * @type {Map<string, Set<string>>}
         */
        this.documents = new Map();
        /**
         * @type {Map<string, number>}
         */
        this.frequencies = new Map();
        this.documentCount = 0;
    }

    /**
     * @param {{strDate: string, strTime: string }} _1
     * @returns {string} - The data, as a key
     */
    #createKey(_1) {
        const { strDate, strTime } = _1;
        return `${strDate} ${strTime}`;
    }
    
    /**
     * @param {Set<string>} tokens 
     * @param {Map<string, number>} expansion 
     * @param {Set<string>} words 
     * @returns {{distance: number, idf: number }} - The distance and best IDF
     */
    #distanceToDocument(tokens, expansion, words) {
        let scan = [];
        for(const candidate of expansion.keys()) {
            if(words.has(candidate)) {
                const idf = Math.log((1 + this.documentCount) / (
                    1 + (this.frequencies.get(candidate) || 0)
                ));
                const weight = tokens.has(candidate) ? 1. : 0.9;
                scan.push({weight, idf });
            }
        }

        let product = 0.;
        let closestDistance = 0.;
        let bestIdf = 0.;
        for(const {weight, idf} of scan) {
            product += 0.9 * weight;
            if(weight > closestDistance) {
                closestDistance = weight;
                bestIdf = idf;
            } else if (weight == closestDistance) {
                bestIdf = bestIdf < idf ? idf : bestIdf;
            }
        }
        return {
            distance: product,
            idf: bestIdf
        };
    }

    /**
     * @param {Set<string>} tokens
     * @returns {Map<string, number>} 
     */
    #expansionOfWords(tokens) {
        /**
         * @type {Map<string, number>}
         */
        const expansion = new Map();

        for(const token of tokens) {
            for(const candidate of this.frequencies.keys()) {
                const distance = levenshteinDistance(
                    token, candidate, 4
                );
                if (distance <= Math.min(
                    4, token.length / 2, candidate.length
                )) {
                    const weightSoFar = expansion.get(candidate) || NaN;
                    const weight = !isFinite(weightSoFar)
                        ? distance
                        : Math.min(distance, weightSoFar);
                    expansion.set(candidate, weight);
                }
            }
        }

        let upperBound = -Infinity;
        for(const value of expansion.values()) {
            upperBound = Math.max(upperBound, value);
        }
        for(const [key, weight] of expansion.entries()) {
            expansion.set(key, 1 + upperBound - weight);
        }
        for(const token of tokens) {
            expansion.set(token, 1+upperBound);
        }

        return expansion;
    }
    
    /**
     * Accepts a calendar entry and process it in the engine internal state.
     * 
     * @param {{
     *  strDate: string,
     *  strTime: string,
     *  strDescription: string
     * }} _1 
     * ------------------------------------------------------------------------
     */
    acceptAppointment = (_1) => {
        const { strDate, strTime, strDescription } = _1;
        const words = extractTokens(strDescription);
        const key = this.#createKey({ strDate, strTime });

        this.documents.set(key, words);
        for(const word of words) {
            const value = this.frequencies.get(word) || 0;
            this.frequencies.set(word, value + 1);
        }
        this.documentCount += 1;
    };

    /**
     * Cancels an appointment from the calendar. This means the deletion of
     * the corresponding entry in the engine internal state.
     * 
     * @param {{strDate: string, strTime: string}} _1
     * ------------------------------------------------------------------------
     */
    cancelAppointment = (_1) => {
        const key = this.#createKey(_1);
        this.documents.delete(key);
    };

    /**
     * @param {{maximalCount: number, searchQuery: string, past: boolean}} _1
     * @returns
     * ------------------------------------------------------------------------
     */
    search = (_1) => {
        const { maximalCount, searchQuery } = _1;
        const self = this;
        const tokens = extractTokens(searchQuery);
        const expansion = this.#expansionOfWords(tokens);

        /**
         * @typedef {{
         *   distance: number,
         *   idf: number
         * }} QueueEntry
         * 
         * @param {QueueEntry} a 
         * @param {QueueEntry} b 
         * @returns {number}
         */
        const sortFunction = (a,b) => b.distance == a.distance
                                ? b.idf - a.idf
                                : b.distance - a.distance;
        
        const todayDate = now();

        /**
         * @type {Array<QueueEntry & {key: string}>}
         */
        let queue = [];
        let threshold = 0.;

        for(const entries of new BatchedIterator(self.documents.entries())) {
            for(const [key, words] of entries) {
                if(key < todayDate) {
                    continue;
                } else {
                    const  { distance, idf } = self.#distanceToDocument(
                        tokens, expansion, words
                    );
                    if(distance >= threshold) {
                        queue.push({ distance, key, idf });
                    }
                }
            }
            queue.sort(sortFunction);
            if(queue.length > maximalCount) {
                queue = queue.slice(0, maximalCount);
                threshold = (
                    /**
                     * @type{{distance: number}}
                     * */(queue[0])
                ).distance;
            }
        }

        return queue;
    };
}

export { SearchEngine };
