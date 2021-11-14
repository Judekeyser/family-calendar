if (! Array.prototype.max) {
  Array.prototype.max = function(accessor) {
    if (! accessor)
      return this.max (x => x);
    else return this.reduce (
      (x, y) => x === null ? y : (accessor(x) < accessor(y) ? y : x), null
    );
  };
}
if (! Array.prototype.first) {
  Array.prototype.first = function() {
    return this[0];
  };
}
if (! Array.prototype.isNotEmpty) {
  Array.prototype.isNotEmpty = function() {
    return this.length > 0;
  };
}
if (! Array.prototype.isEmpty) {
  Array.prototype.isEmpty = function() {
    return this.length === 0;
  };
}
if (! Array.prototype.last) {
  Array.prototype.last = function() {
    if (this.length == 0)
      return undefined;
    return this[this.length - 1];
  };
}
if (! Array.prototype.filterNot) {
  Array.prototype.filterNot = function(p) {
    return this.filter (x => !p(x));
  };
}
if (! Array.prototype.anyMatch) {
  Array.prototype.anyMatch = function(p) {
    return this.filter(p).isNotEmpty();
  };
}
if (! Array.prototype.flatten) {
  Array.prototype.flatten = function () {
    return this.reduce ((a,b) => [...a, ...b], []);
  };
}
if (! Array.prototype.peek) {
  Array.prototype.peek = function (consumer) {
    this.forEach(_ => consumer(_));
    return this;
  };
}
if (! Array.prototype.flatMap) {
  Array.prototype.flatMap = function(f) {
    return this.map(_ => f(_)).flatten();
  };
}
if (! Array.prototype.sortedBy) {
  Array.prototype.sortedBy = function(extractor) {
    return [...this].sort((a,b) => {
      var eA = extractor(a),
          eB = extractor(b);
      if (eA == eB) return 0;
      else if (eA < eB) return -1;
      else return 1;
    });
  }
}
if (! Array.prototype.groupBy) {
  Array.prototype.groupBy = function(discriminant) {
    var stack = {};
    var keys = [];
    this.forEach(_ => {
      var hash = discriminant(_);
      if (! stack[hash]) {
        stack[hash] = [];
        keys.push(hash);
      }
      stack[hash].push(_);
    });
    return keys.map(key => ({key, values: stack[key]}));
  }
}
if (! Array.asKeyValueStream) {
  Array.asKeyValueStream = function(obj) {
    return Object.keys(obj)
      .map(key => ({
        key,
        value: obj[key]
      }));
  }
}
if (! Array.prototype.toSet) {
  Array.prototype.toSet = function() {
    return new Set(this);
  };
}
