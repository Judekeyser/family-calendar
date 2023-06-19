import json
import base64
import re
import unicodedata
from math import sqrt

from typing import NamedTuple


STOP_WORDS = {
    b"au",
    b"aux",
    b"avec",
    b"ce",
    b"ces",
    b"dans",
    b"de",
    b"des",
    b"du",
    b"elle",
    b"en",
    b"et",
    b"eux",
    b"il",
    b"je",
    b"la",
    b"le",
    b"leur",
    b"lui",
    b"ma",
    b"mais",
    b"me",
    b"meme",
    b"mes",
    b"moi",
    b"mon",
    b"ne",
    b"nos",
    b"notre",
    b"nous",
    b"on",
    b"ou",
    b"par",
    b"pas",
    b"pour",
    b"qu",
    b"que",
    b"qui",
    b"sa"
    b"se",
    b"ses",
    b"son",
    b"sur",
    b"ta",
    b"te",
    b"tes",
    b"toi",
    b"ton",
    b"tu",
    b"un",
    b"une",
    b"vos",
    b"votre",
    b"vous",
    b"c",
    b"d",
    b"j",
    b"l",
    b"a",
    b"m",
    b"n",
    b"s",
    b"t",
    b"y",
    b"ete",
    b"etee",
    b"etees",
    b"etes",
    b"etant",
    b"suis",
    b"es",
    b"est",
    b"sommes",
    b"etes",
    b"sont",
    b"serai",
    b"seras",
    b"sera",
    b"serons",
    b"serez",
    b"seront",
    b"serais",
    b"serait",
    b"serions",
    b"seriez",
    b"seraient",
    b"etais",
    b"etait",
    b"etions",
    b"etiez",
    b"etaient",
    b"fus",
    b"fut",
    b"fumes",
    b"futes",
    b"furent",
    b"sois",
    b"soit",
    b"soyons",
    b"soyez",
    b"soient",
    b"fusse",
    b"fusses",
    b"fut",
    b"fussions",
    b"fussiez",
    b"fussent",
    b"ayant",
    b"eu",
    b"eue",
    b"eues",
    b"eus",
    b"ai",
    b"as",
    b"avons",
    b"avez",
    b"ont",
    b"aurai",
    b"auras",
    b"aura",
    b"aurons",
    b"aurez",
    b"auront",
    b"aurais",
    b"aurait",
    b"aurions",
    b"auriez",
    b"auraient",
    b"avais",
    b"avait",
    b"avions",
    b"aviez",
    b"avaient",
    b"eut",
    b"eumes",
    b"eutes",
    b"eurent",
    b"aie",
    b"aies",
    b"ait",
    b"ayons",
    b"ayez",
    b"aient",
    b"eusse",
    b"eusses",
    b"eut",
    b"eussions",
    b"eussiez",
    b"eussent",
    b"ceci",
    b"cela",
    b"cet",
    b"cette",
    b"ici",
    b"ils",
    b"les",
    b"leurs",
    b"quel",
    b"quels",
    b"quelle",
    b"quelles",
    b"sans",
    b"soi"
}


__vowels = set(b"aeiouy")
__consonnes = set(b"bcdfgjklmnpqrstvwxz")
__consonnes_without_n = set(b"bcdfgjklmpqrstvwxz")
__consonnes_without_m = set(b"bcdfgjklnpqrstvwxz")

        
# representation:
#   on  --> O
#   ou  --> U    
#   an  --> A 
#   eu  --> E 
#   in  --> I
#   ille -> Y
#   ch  --> H
#   
# heuristique:
#   le H est conserver le plus longtemps possible. Supprimé à la fin.
#   Traitement d'une lettre A:
#     - au -> o 
#     - an/ -> A 
#     - ain/ -> I 
#     - aille -> aY
#     - ai -> e 
#   Traitement d'une lettre C:
#     - ch -> H
#     - cc -> x
#     - ci -> s[i] 
#     - ç -> s
#     - ce -> s[e]
#     - cq -> [q]
#   Traitement d'une lettre E:
#     - eille -> eY
#     - ein/ ->  I 
#     - ei   -> e 
#     - eau  -> o 
#     - en/  -> A 
#     - em/  -> A 
#     - eu   -> E 
#   Traitement d'une lettre G:
#     - geo -> j[o] 
#     - gea -> j[a]
#     - gi  -> j[i]
#     - gy  -> j[y]
#     - ge  -> j[e]    
#     - gui -> g[i]
#     - guy -> g[y]
#     - gue -> g[e]
#   Traitement d'une lettre I:
#     - in/ -> I 
#     - im/ -> I 
#   Traitement d'une lettre O:
#     - on/ -> O 
#     - om/ -> O 
#     - ou  -> U 
#   Traitement d'une lettre P:
#     - ph -> f
#   Traitement d'une lettre Q:
#     - qu -> k
#     - q -> k
#   Traitement d'une lettre U:
#     - un/ -> I 
#     - um/ -> I 

def __transform_n_terminated(word, diphtongue, replacement):
    length = len(diphtongue)
    if word.startswith(diphtongue):
        if len(word) == length:
            return b'', replacement
        elif len(word) > length:
            if word[length] in __vowels | set(b'hn'):
                return word[length:], diphtongue
            else:
                return word[length:], replacement

def __transform_m_terminated(word, diphtongue, replacement):
    length = len(diphtongue)
    if word.startswith(diphtongue):
        if len(word) == length:
            return b'', replacement
        elif len(word) > length:
            if word[length] in __vowels | set(b'hm'):
                return word[length:], diphtongue
            else:
                return word[length:], replacement

def __transform_substitute(word, diphtongue, replacement):
    if word.startswith(diphtongue):
        return word[len(diphtongue):], replacement

def handle_g(word):
    if word.startswith(b'gea'):
        return word[2:], b'j'
    if word.startswith(b'geo'):
        return word[2:], b'j'
    elif word.startswith(b'gi'):
        return word[1:], b'j'
    elif word.startswith(b'gy'):
        return word[1:], b'j'
    elif word.startswith(b'ge'):
        return word[1:], b'j'
    elif word.startswith(b'gui'):
        return word[2:], b'g'
    elif word.startswith(b'gue'):
        return word[2:], b'g'
    elif word.startswith(b'guy'):
        return word[2:], b'g'

def handle_c(word):
    if word.startswith(b'ch'):
        return word[2:], b'C'
    elif word.startswith(b'cc'):
        return word[2:], b'x'
    elif word.startswith(b'cq'):
        return word[1:], b''
    elif word.startswith(b'ci'):
        return word[1:], b's'
    elif word.startswith(b'ce'):
        return word[1:], b's'
    elif word.startswith(b'c'):
        return word[1:], b'k'

def handle_doubled_letters(word):
    if len(word) > 1:
        if word[1] == word[0]:
            return word[1:], b''
                


transformers = [
    handle_g,
    
    handle_c,
    lambda word: __transform_substitute(word, diphtongue=b'qu', replacement=b'k'),
    lambda word: __transform_substitute(word, diphtongue=b'q', replacement=b'k'),
    lambda word: __transform_substitute(word, diphtongue=b'ph', replacement=b'f'),
    lambda word: __transform_substitute(word, diphtongue=b'ille', replacement=b'Y'),
    
    lambda word: __transform_n_terminated(word, diphtongue=b'on', replacement=b'O'),
    lambda word: __transform_m_terminated(word, diphtongue=b'om', replacement=b'O'),
    lambda word: __transform_n_terminated(word, diphtongue=b'ain', replacement=b'I'),
    lambda word: __transform_m_terminated(word, diphtongue=b'aim', replacement=b'I'),
    lambda word: __transform_n_terminated(word, diphtongue=b'an', replacement=b'A'),
    lambda word: __transform_m_terminated(word, diphtongue=b'am', replacement=b'A'),
    lambda word: __transform_n_terminated(word, diphtongue=b'ein', replacement=b'I'),
    lambda word: __transform_m_terminated(word, diphtongue=b'eim', replacement=b'I'),
    lambda word: __transform_n_terminated(word, diphtongue=b'en', replacement=b'A'),
    lambda word: __transform_m_terminated(word, diphtongue=b'em', replacement=b'A'),
    lambda word: __transform_n_terminated(word, diphtongue=b'in', replacement=b'I'),
    lambda word: __transform_m_terminated(word, diphtongue=b'im', replacement=b'I'),
    lambda word: __transform_n_terminated(word, diphtongue=b'un', replacement=b'I'),
    lambda word: __transform_m_terminated(word, diphtongue=b'um', replacement=b'I'),
    
    lambda word: __transform_substitute(word, diphtongue=b'au', replacement=b'o'),
    lambda word: __transform_substitute(word, diphtongue=b'eau', replacement=b'o'),
    lambda word: __transform_substitute(word, diphtongue=b'eu', replacement=b'E'),
    lambda word: __transform_substitute(word, diphtongue=b'ai', replacement=b'e'),
    lambda word: __transform_substitute(word, diphtongue=b'ei', replacement=b'e'),
    lambda word: __transform_substitute(word, diphtongue=b'ou', replacement=b'U'),
    
    lambda word: __transform_substitute(word, diphtongue=b'y', replacement=b'i'),
]

post_transformers = [
    handle_doubled_letters,
    lambda word: __transform_substitute(word, diphtongue=b'h', replacement=b''),
]



def normalize_word(word):
    word = unicodedata.normalize('NFKD', word).replace(unicodedata.normalize('NFKD', "ç"), "ss")
    lowered = word.encode('ascii', 'ignore').lower()
    
    candidate = bytes(
        letter for letter in lowered
        if letter in set(b"abcdefghijklmnopqrstuvwxyz")
    )
    if len(candidate) > 1 and candidate not in STOP_WORDS:
        if candidate == b'eau':
            return candidate
        
        # Clean diphtongues
        source = candidate; target = list()
        
        while len(source):
            for transformer in transformers:
                transformed = transformer(source)
                if transformed is not None:
                    source, _t, *_ = transformed
                    target += _t
                    break
            else:
                target.append(source[0])
                source = source[1:]
        
        # Some combinations might be explicit now, like `tiO` and `tiA`
        specific_transformers = [
            lambda word: __transform_substitute(word, diphtongue=b'tiA', replacement=b'siA'),
            lambda word: __transform_substitute(word, diphtongue=b'tiO', replacement=b'siO'),
        ]
        source = bytes(target); target = list()
        while len(source):
            for transformer in specific_transformers:
                transformed = transformer(source)
                if transformed is not None:
                    source, _t, *_ = transformed
                    target += _t
                    break
            else:
                target.append(source[0])
                source = source[1:]
        
        # Revert back ille -> Y for uniformity
        # Remove doubled letters
        # Remove H
        source = bytes(target); target = list()
        
        while len(source):
            for transformer in post_transformers:
                transformed = transformer(source)
                if transformed is not None:
                    source, _t, *_ = transformed
                    target += _t
                    break
            else:
                target.append(source[0])
                source = source[1:]
        
        return bytes(target)
        
            
            
def words_of(description):
    return set(
        c
        for _ in re.split(r'\W+', description)
        for c in (normalize_word(_),)
        if c is not None
    )


def to_vect(words):
    vec = dict()
    for word in words:
        if word not in vec:
            vec[word] = 0
        vec[word] += 1
    return vec


def distance(s0, s1, upper_bound):
    if s0 == s1:
        return 0.0

    n, m = len(s0), len(s1)
    if n == 0:
        return 1.0 * n
    if m == 0:
        return 1.0 * m

    d = [[0] * (m + 2) for _ in range(n + 2)]
    for i in range(n + 1):
        d[i][0] = i
    for j in range(m + 1):
        d[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if j == m and i == n and d[n][m] >= upper_bound:
                return d[n][m]
               
            cost = 1
            if s0[i - 1] == s1[j - 1]:
                cost = 0
            d[i][j] = min(d[i - 1][j - 1] + cost, d[i][j - 1] + 1, d[i - 1][j] + 1)

            if i > 1 and j > 1 and s0[i - 1] == s1[j - 2] and s0[i - 2] == s1[j - 1]:
                d[i][j] = min(d[i][j], d[i - 2][j - 2] + cost)

    return d[n][m]
    
    
def levenshtein(x, y, upper_bound):
    def _leven(a, b, distance_so_far):
        if distance_so_far > upper_bound:
            return distance_so_far
        
        if not a:
            return distance_so_far + len(b)
        if not b:
            return distance_so_far + len(a)
        if a[0] == b[0]:
            return _leven(a[1:], b[1:], distance_so_far)
        else:
            return min(
                _leven(a[1:], b, 1+distance_so_far),
                _leven(a, b[1:], 1+distance_so_far),
                _leven(a[1:], b[1:], 1+distance_so_far)
            )
    
    return _leven(x, y, 0)
    


def consonent_distance(a, b):
    if a == b:
        return 0
    else:
        if a in set(b'oO') and b in set(b'oO'):
            return 0.3
        if a in set(b'aA') and b in set(b'aA'):
            return 0.3
        if a in set(b'eE') and b in set(b'eE'):
            return 0.3
        if a in set(b'iI') and b in set(b'iI'):
            return 0.3
        if a in set(b'yiY') and b in set(b'yiY'):
            return 0.3
        
        if a in set(b'vf') and b in set(b'vf'):
            return 0.7
        
        if a in set(b'bp') and b in set(b'bp'):
            return 0.7
        
        if a in set(b'td') and b in set(b'td'):
            return 0.7
        
        if a in set(b'sz') and b in set(b'sz'):
            return 0.7
    
    return 1
        

  
def levenshtein_biased(x, y, upper_bound):
    if len(x) > len(y):
        return levenshtein_biased(y, x, upper_bound)
    assert len(x) <= len(y)
    def _leven(a, b, distance_so_far, penalization):
        if distance_so_far > upper_bound:
            return float('inf')
        if penalization >= 3:
            return float('inf')
        
        if not a:
            if len(x) >= 4 and distance_so_far <= 1 and x[0] == y[0]:
                return distance_so_far
            else:
                return distance_so_far + len(b)
        if not b:
            return distance_so_far + len(a)
        if a[0] == b[0]:
            return _leven(a[1:], b[1:], distance_so_far, penalization - 1)
        else:
            dist = consonent_distance(a[0], b[0])
            new_distance = distance_so_far + dist
            new_penalization = penalization + (1 if dist >= 0.5 else 0)
            return min(
                _leven(a[1:], b, new_distance, new_penalization),
                _leven(a, b[1:], new_distance, new_penalization),
                _leven(a[1:], b[1:], new_distance, new_penalization)
            )
    
    return _leven(x, y, 0, 0)
    

def LCSLength(x, y):
    def _length(X, Y, i, j, dp={}):
        if i == 0 or j == 0:
            return 0
        key = (i, j)
        if key not in dp:

            if X[i - 1] == Y[j - 1]:
                dp[key] = _length(X, Y, i - 1, j - 1, dp) + 1

            else:
                dp[key] = max(_length(X, Y, i, j - 1, dp), _length(X, Y, i - 1, j, dp))

        return dp[key]
    
    return _length(x, y, len(x), len(y))


def expansion_weights(size):
    logs = [log(_+1) for _ in range(size)]
    rev_logs = logs[::-1][:5]
    return [_/rev_logs[0] for _ in rev_logs]


def iterate_descriptions(func):
    with open('db_export.csv') as f:
        for index, line in enumerate(f):
            if not index: continue
            
            line = line.strip()
            try:
                time, line = line.split(',')
                time = time[1:-1]
                line = line[1:-1]
                line = base64.b64decode(line)
                data = json.loads(line)
            except Exception as e:
                print("ERROR LINE " + str(index))
                print(line)
                raise e
            else:
                try:
                    description = data['strDescription']
                except:
                    try:
                        description = data['toCreate']['strDescription']
                    except Exception as e:
                        ...
                        #print("ERROR LINE " + str(index))
                        #print(json.dumps(data, indent=2))
                else:
                    func(time=time, raw=data, raw_description=description)


if __name__ == '__main__':
    calendar = dict()
    documents = dict()
    
    def fill_all_descriptions(time, raw, raw_description):
        global documents, calendar
        words = words_of(raw_description)
        documents[time] = to_vect(words)
        calendar[time] = raw_description

    iterate_descriptions(fill_all_descriptions)
    dictionary = set(
        keyword
        for document in documents.values()
        for keyword in document.keys()
    )
    idfs = dict(
        (keyword, sum(1 for doc in documents.values() if keyword in doc.keys()) / len(documents))
        for keyword in dictionary
    )
    
    print("ENTER A SEARCH")
    query = input()
    user_words = to_vect(words_of(query))
    
    
    def candidates(user_word):
        for _c1 in dictionary:
            _dist = levenshtein_biased(user_word, _c1, upper_bound=4)
            if _dist <= min(4, max(len(_c1), len(user_word))/2):
                yield _dist, _c1
            
    
    
    expansion = dict()
    for user_word in user_words:
        for score, candidate in candidates(user_word):
            value = expansion.get(candidate, float('inf'))
            expansion[candidate] = min(score, value)
    
    upper_bound = max(expansion.values())
    for candidate in expansion:
        expansion[candidate] = 1 + upper_bound - expansion[candidate]
        
    def euclidean_scp(a, b):
        keys = set(a) | set(b)
        p = 0.
        for key in keys:
            p += a.get(key, 0.) * b.get(key, 0.) * (1. - idfs[key])
        return p
    
    sorting = sorted(list(
        (time, score)
        for time in documents
        for score in (euclidean_scp(documents[time], expansion),)
        if score > 0
    ), key=lambda t: -t[1])[:20]
    
    
    
    print("================")
    print("================")
    print("YOU SEARCHED FOR <%s>" % (query,))
    print("================")
    print(expansion)
    print(dict(
        (keyword, idfs[keyword])
        for keyword in expansion
    ))
    print("================")
    print("BEST RESULTS FOUND (TOP 10):")
    
    for sorted in sorting:
        print("------------------")
        print(calendar[sorted[0]])