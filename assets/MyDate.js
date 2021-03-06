function MyDate(timeStamp) {
  this.resetTimeStamp (timeStamp);
}

MyDate.prototype = {
  copy: function() {
    return new MyDate(this.timeStamp);
  },
  nextDate: function() {
    var nextTimeStamp = this.timeStamp + 24*60*60*1_000;
    return new MyDate (nextTimeStamp);
  },
  previousDate: function() {
    var previousTimeStamp = this.timeStamp - 24*60*60*1_000;
    return new MyDate (previousTimeStamp);
  },
  isMonday: function() {
    return this.dateRepr.getDay() == 1;
  },
  isDaysBefore: function(another) {
    if (this.timeStamp < another.timeStamp) {
      if (this.asFormattedString() < another.asFormattedString()) {
        return true;
      }
    }
    return false;
  },
  hasSameMonthThan: function(another) {
    return this.twoDigitsMonth() == another.twoDigitsMonth();
  },
  fourDigitsYear: function() {
    return this.dateRepr.getFullYear();
  },
  twoDigitsMonth: function() {
    var month = this.dateRepr.getMonth() + 1;
    return month >= 10 ? month : ('0'+month);
  },
  twoDigitsDay: function() {
    var day = this.dateRepr.getDate();
    return day >= 10 ? day : ('0'+day);
  },
  asFormattedString: function() {
    return `${this.fourDigitsYear()}-${this.twoDigitsMonth()}-${this.twoDigitsDay()}`;
  },
  equals: function(anotherDate) {
    return anotherDate.fourDigitsYear() == this.fourDigitsYear()
        && anotherDate.twoDigitsMonth() == this.twoDigitsMonth()
        && anotherDate.twoDigitsDay()   == this.twoDigitsDay();
  },
  resetTimeStamp: function (timeStamp) {
    this.timeStamp = timeStamp;
    this.dateRepr = new Date (timeStamp);
  }
}

MyDate.fromJSDate = function (jsDate) {
  var timeStamp = jsDate.getTime();
  return new MyDate (timeStamp);
}
MyDate.fromFormattedString = function (formattedString) {
  var timeStamp = Date.parse (formattedString);
  return new MyDate (timeStamp);
}

MyDate.now = function() {
  return new MyDate(Date.now());
}
