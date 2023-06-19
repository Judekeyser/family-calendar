function extractTokens(strDescription) {
    return new Set([
        ... strDescription.matchAll(/\b\w+\b/ig)
    ].map(uniformizeDiphtongues).filter(_ => !!_));
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
    if(source.startWith(diphtongue))
        return [source.slice(diphtongue.length), replacement]
}

const Vowels = new Set("aeiouyh")
function substitute_termination(source, diphtongue, replacement) {
    let length = diphtongue.length;
    let termination = diphtongue[length - 1];
    if (source.startWith(diphtongue)) {
        if(source.length == length || (
            source[length] != termination && !Vowels.has(source[length])
        ))
            return [source.slice(length), replacement]
    }
}

const clean_diphtongues_transformers = [
    source => { /* Handle C */
        if(source.startWith('ch'))
            return [source.slice(2), 'C']
        else if(source.startWith('cc'))
            return [source.slice(2), 'x']
        else if(source.startWith('cq'))
            return [source.slice(1), '']
        else if(source.startWith('ci'))
            return [source.slice(1), 's']
        else if(source.startWith('ce'))
            return [source.slice(1), 's']
        else if(source.startWith('c'))
            return [source.slice(1), 'k']
    },
    
    source => { /* Handle G */
        if(source.startWith('gea'))
            return [source.slice(2), 'j']
        else if(source.startWith('geo'))
            return [source.slice(2), 'j']
        else if(source.startWith('gi'))
            return [source.slice(1), 'j']
        else if(source.startWith('gy'))
            return [source.slice(1), 'j']
        else if(source.startWith('ge'))
            return [source.slice(1), 'j']
        else if(source.startWith('gui'))
            return [source.slice(2), 'g']
        else if(source.startWith('guy'))
            return [source.slice(2), 'g']
        else if(source.startWith('gue'))
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
    word = word.replace(/[^\x00-\x7F]/g,"");
    
    if(word.length <= 1) return null;
    
    source = word;
    source = applyTransformers(source, clean_diphtongues_transformers);
    source = applyTransformers(source, phonem_simplification_transformers);
    source = applyTransformers(source, post_clean_transformers);
    
    if(word.length <= 1) return null;
    
    return source.join("")
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
function distanceBetweenLetters(a, b) {
    if(a == b)
        return 0;
    else {
        for(let weight in _relatedLetters) {
            for(let cluster in _relatedLetters[weight]) {
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
        return levenshtein_distance(y, x, upperBound)
    
    return _recursiveLevenshtein(x, y, 0, 0, { x, y, upperBound })
}


function SearchEngine() {
    this._SearchEngine__Calendar = new Map();
    this._SearchEngine__WordFrequencies = new Map();
    this._SearchEngine__DocumentCount = 0;
};
SearchEngine.prototype = {    
    _SearchEngine__insertInVirtualCalendar: function({ strDate, strTime, words }) {
        if(this._SearchEngine__Calendar.has(strDate)) {
            var dateMap = this._SearchEngine__Calendar.get(strDate)
        } else {
            var dateMap = new Map();
        }
        this._SearchEngine__Calendar.set(strDate, dateMap);
        dateMap.set(strTime, words);
        
        console.log(dateMap)
    },
    
    _SearchEngine__removeFromVirtualCalendar: function({ strDate, strTime }) {
        if(this._SearchEngine__Calendar.has(strDate)) {
            let dateMap = this._SearchEngine__Calendar.get(strDate)
            dateMap.delete(strTime)
            if(dateMap.size === 0) {
                this._SearchEngine__Calendar.delete(strDate)
            }
        }
    },
    
    _SearchEngine__registerDocument: function({ words }) {
        for(let word of words) {
            if(this._SearchEngine__WordFrequencies.has(word)) {
                var value = this._SearchEngine__WordFrequencies.get(word)
            } else {
                var value = 0
            }
            this._SearchEngine__WordFrequencies.set(word, value + 1)
        }
        this._SearchEngine__DocumentCount += 1;
    },
    
    /* Exposed getters */
    get acceptAppointment() {
        return (function({ strDate, strTime, strDescription }) {
            let words = extractTokens(strDescription)

            this._SearchEngine__registerDocument({ words })
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
        return (function({ searchQuery }) {
            let tokens = extractTokens(strDescription);
        }).bind(this);
    }
}

export { SearchEngine }