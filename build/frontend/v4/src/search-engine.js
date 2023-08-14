function* batchRecords(records) {

    emitBatch: for(;;) {
        let batch = []
        try {
            for(let i = 0; i < 30; i++) {
                let { value, done } = records.next()
                if(!done) {
                    batch.push(value)
                } else break emitBatch
            }
        } finally {
            if(batch.length)
                yield batch
        }
    }
}



function extractTokens(strDescription) {
    return new Set([
        ... strDescription.matchAll(/\b\w+\b/ig)
    ].map(([first]) => first).map(uniformizeDiphtongues).filter(_ => !!_));
}

function applyTransformers(source, transformers) {
    let target = [];
    let _target;
    
    while(source.length) {
        applicative: {
            for(let transformer of transformers) {
                let transformed = transformer(source)
                if(transformed) {
                    [source, _target] = transformed;
                    target = target.concat(_target);
                    break applicative;
                }
            }
            target.push(source[0])
            source = source.slice(1)
        }
    }
    
    return target.join("");
}

function substitute(source, diphtongue, replacement) {
    if(source.startsWith(diphtongue))
        return [source.slice(diphtongue.length), replacement]
}

const Vowels = new Set("aeiouyh")
function substitute_termination(source, diphtongue, replacement) {
    let length = diphtongue.length;
    let termination = diphtongue[length - 1];
    if (source.startsWith(diphtongue)) {
        if(source.length == length || (
            source[length] != termination && !Vowels.has(source[length])
        ))
            return [source.slice(length), replacement]
    }
}

const clean_diphtongues_transformers = [
    source => { /* Handle C */
        if(source.startsWith('ch'))
            return [source.slice(2), 'C']
        else if(source.startsWith('cc'))
            return [source.slice(2), 'x']
        else if(source.startsWith('cq'))
            return [source.slice(1), '']
        else if(source.startsWith('ci'))
            return [source.slice(1), 's']
        else if(source.startsWith('ce'))
            return [source.slice(1), 's']
        else if(source.startsWith('c'))
            return [source.slice(1), 'k']
    },
    
    source => { /* Handle G */
        if(source.startsWith('gea'))
            return [source.slice(2), 'j']
        else if(source.startsWith('geo'))
            return [source.slice(2), 'j']
        else if(source.startsWith('gi'))
            return [source.slice(1), 'j']
        else if(source.startsWith('gy'))
            return [source.slice(1), 'j']
        else if(source.startsWith('ge'))
            return [source.slice(1), 'j']
        else if(source.startsWith('gui'))
            return [source.slice(2), 'g']
        else if(source.startsWith('guy'))
            return [source.slice(2), 'g']
        else if(source.startsWith('gue'))
            return [source.slice(2), 'g']
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
]
const phonem_simplification_transformers = [
    source => substitute(source, 'tiO', 'siO'),
    source => substitute(source, 'tiA', 'siA')
]
const post_clean_transformers = [
    source => { /* Handle doubled letters */
        if(source.length > 1) {
            let firstLetter = source[0];
            if(firstLetter === source[1]) {
                return [source.slice(1), '']
            }
        }
    },
    
    source => substitute(source, 'h', '')
]

function uniformizeDiphtongues(word) {
    if(StopWords.has(word)) return null;
    if(word == "eau") return word;

    word = word.replaceAll("ç", "ss")
    word = word.replaceAll("ï", "hi")
    word = word.replaceAll("ë", "he")
    word = word.replaceAll("ü", "hu")
    word = word.replaceAll("ö", "ho")
    word = word.replaceAll("ä", "ha")
    word = word.normalize('NFKD')
    word = word.replace(/[^\x20-\x7F]/g,"");
    
    if(word.length <= 1) return null;
    
    let source = word;
    source = applyTransformers(source, clean_diphtongues_transformers);
    source = applyTransformers(source, phonem_simplification_transformers);
    source = applyTransformers(source, post_clean_transformers);
    
    if(source.length <= 1) return null;
    return source
}

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
])



const _relatedLetters = {
    0.3: [
        new Set('oO'),
        new Set('aA'),
        new Set('eE'),
        new Set('iI'),
        new Set('yiI')
    ],
    0.7: [
        new Set('vf'),
        new Set('bp'),
        new Set('td'),
        new Set('sz')
    ],
}
function _letterDistance(a, b) {
    if(a == b)
        return 0;
    else {
        for(let weight in _relatedLetters) {
            for(let cluster of _relatedLetters[weight]) {
                if(cluster.has(a) && cluster.has(b)) {
                    return weight
                }
            }
        }
        return 1;
    }
}

function _recursiveLevenshtein(a, b, distanceSoFar, penalization, config) {
    let { x, y, upperBound } = config
    if(distanceSoFar > upperBound)
        return Infinity
    else if(penalization >= 3)
        return Infinity
    
    if(!a.length) {
        if(x.length >= 4 && distanceSoFar <= 1 && x[0] == y[0])
            return distanceSoFar
        else
            return distanceSoFar + b.length
    } else if(!b.length) {
        return distanceSoFar + a.length
    } else if (a[0] === b[0]) {
        return _recursiveLevenshtein(
            a.slice(1), b.slice(1),
            distanceSoFar, penalization-1,
            config
        )
    } else {
        let distanceBetweenLetters = _letterDistance(a[0], b[0]);
        distanceSoFar += distanceBetweenLetters
        penalization += distanceBetweenLetters >= 0.5 ? 1 : 0;
        return Math.min(
            _recursiveLevenshtein(a.slice(1), b.slice(1), distanceSoFar, penalization, config),
            _recursiveLevenshtein(a, b.slice(1), distanceSoFar, penalization, config),
            _recursiveLevenshtein(a.slice(1), b, distanceSoFar, penalization, config),
        )
    }
}

function levenshteinDistance(x, y, upperBound) {
    if (x.length > y.length)
        return levenshteinDistance(y, x, upperBound)
    
    return _recursiveLevenshtein(x, y, 0, 0, { x, y, upperBound })
}


function SearchEngine() {
    this._SearchEngine__Calendar = new Map(/* strDate => strTime => words */);
    this._SearchEngine__WordFrequencies = new Map(/* word => frequency */);
    this._SearchEngine__DocumentCount = 0;
}
SearchEngine.prototype = {
    _SearchEngine__createKey: function({ strDate, strTime }) {
        return `${strDate} ${strTime}`
    },

    _SearchEngine__insertInVirtualCalendar: function({ strDate, strTime, words }) {
        let key = this._SearchEngine__createKey({ strDate, strTime })
        this._SearchEngine__Calendar.set(key, words);

        for(let word of words) {
            let value = this._SearchEngine__WordFrequencies.get(word) || 0
            this._SearchEngine__WordFrequencies.set(word, value + 1)
        }
        this._SearchEngine__DocumentCount += 1;
    },
    
    _SearchEngine__removeFromVirtualCalendar: function({ strDate, strTime }) {
        let key = this._SearchEngine__createKey({ strDate, strTime })
        this._SearchEngine__Calendar.delete(key);
    },

    _SearchEngine__distanceToDocument(expansion, words) {
        let L = this._SearchEngine__DocumentCount
        let product = 0.
        for(let word of words) {
            product += (expansion.get(word) || 0.) * (1. - this._SearchEngine__WordFrequencies.get(word) / L)
        }
        return product
    },
    
    /* Exposed getters */
    get acceptAppointment() {
        return (function({ strDate, strTime, strDescription }) {
            let words = extractTokens(strDescription)
            this._SearchEngine__insertInVirtualCalendar({
                strDate, strTime, words
            })
        }).bind(this);
    },
    get cancelAppointment() {
        return (function({ strDate, strTime }) {
            this._SearchEngine__removeFromVirtualCalendar({ strDate, strTime })
        }).bind(this);
    },
    get search() {
        return (function({ maximalCount, searchQuery }) {
            let self = this
            let expansion; /* define */ {
                const TOC = Date.now()
                let tokens = extractTokens(searchQuery);

                expansion = new Map()
                let upperBound = -Infinity
                for(let token of tokens) {
                    for(let candidate of self._SearchEngine__WordFrequencies.keys()) {
                        let distance = levenshteinDistance(token, candidate)
                        if (distance <= Math.min(4, Math.max(token.length / 2, candidate.length))) {
                            let value = expansion.get(candidate)
                            value = value == null || !isFinite(value) ? Infinity : value
                            value = Math.min(distance, value)
                            
                            upperBound = value > upperBound ? value : upperBound
                            expansion.set(candidate, value)
                        }
                    }
                }
                for(let key of [...expansion.keys()]) {
                    expansion.set(key, 1 + upperBound - expansion.get(key))
                }

            console.log("** Took", Date.now() - TOC)
            console.log("** EXPENSION COMPUTED", expansion)
            }

            let threshold = 0.
            let queue = [];
            for(let entries of batchRecords(self._SearchEngine__Calendar.entries())) {
                for(let [key, words] of entries) {
                    let distance = self._SearchEngine__distanceToDocument(expansion, words)
                    if(distance > threshold) {
                        queue.push({ distance, key })
                    }
                }
                if(queue.length > maximalCount) {
                    queue.sort((a,b) => b.distance - a.distance)
                    queue = queue.slice(0, maximalCount)
                    threshold = queue[0]
                }
            }

            return queue
        }).bind(this);
    }
}

export { SearchEngine }