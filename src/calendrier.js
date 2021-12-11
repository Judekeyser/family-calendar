var event_v1 = ({ date, time, description, kind }) => ({
  strDate: date.toString(),
  strTime: time.toString(),
  description,
  kind
});


var event_to_record_converter = (function(f) {
 return event => ({
  event: f(event),
  version: 1
});
})(event_v1);

var http_business_response_bridge = ({ status, records }) => {
  switch(status || 0) {
    case 200: return { records };
    case 401: return { isNotAuth: true };
    case 403: throw "Forbidden";
    default : throw "Unknown";
  }
};


var http_business_request_bridge = ({ record, cursor, password, csrfToken }) => ({
  'Accept'         : 'application/json',
  'Content-Type'   : record ? 'application/json' : undefined,
  'Authentication' : password,
  'X-Csrf-Token'   : csrfToken
 });


var http_request_bridge = ({ url, record, headers }) => new Promise((res, rej) => {
  var req = new XMLHttpRequest();
  req.onerror = e => rej(e);
  req.onreadystatechange = () => {
    if (req.readyState == 4)
      res({ status: req.status, data: req.response });
  };
  req.open(method, url);
  for(key in headers) if (headers[key])
    req.setRequestHeader(key, headers[key]);
  req.send(record);
});


var event_v1_invert = (function(h) {
 return ({ strDate, strTime, description, kind }) => {
  convert: {
    if (!kind || !description || !strDate || !strTime)
      break convert;
    var date = MyDate.fromString(strDate),
        time = MyTime.fromString(strTime);
    if (!date || !time) break convert;
    if (kind != 'create' || kind != 'cancel') break convert;

    return { kind, description, date, time };
  } or_else_nothing: {
    return null;
  }
};
})(event_v1);

var version_to_record_converter = (function(f1) {
 return ({ version }) => {
  switch (version) {
    case 1:  return f1;
    default: return () => null;
  }
};
})(event_v1_invert);

var http_business_bridge = (function(f,h,r) {
 return x => !(x.headers = h(x)) || f(x).then(r);
})(http_request_bridge,http_business_request_bridge,http_business_response_bridge);

var record_to_event_converter = (function(f) {
 return ({ event, version }) => f(version)(event);
})(version_to_record_converter);

