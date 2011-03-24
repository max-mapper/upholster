var express = require("../express/lib/express"); // github checkout 3f31ebc676b505858d2b62352f860dd09beea035
var mustache = require("mustache");
var request = require("request");
var sys = require ('sys');

var mustacheWrapper = {
  compile: function (source, options) {
    if (typeof source == 'string') {
      return function(options) {
        options.locals = options.locals || {};
        options.partials = options.partials || {};
        if (options.body) // for express.js > v1.0
          locals.body = options.body;
        return mustache.to_html(
          source, options.locals, options.partials);
      };
    } else {
      return source;
    }
  },
  render: function (template, options) {
    template = this.compile(template, options);
    return template(options);
  }
};

var headers = {'content-type':'application/json', 'accept':'application/json'};

function parseResponse(err, resp, body) {
  if (err) {
    msg = {"error" : "http_error", "reason": err.message}
  } else if (body) {
    msg = JSON.parse(body);
  } else if (resp) {
    msg = JSON.parse(resp);
  }
  return msg;
}

function createDb(db, couch, callback) {
  request({method: "GET", uri:couch + "/" + db, headers:headers}, function(err, resp, body) {
    var msg = parseResponse(err, resp, body);
    if (msg.error && msg.reason === "no_db_file") {
      request({method: "PUT", uri:couch + "/" + db, headers:headers}, function(err, resp, body) {
         msg = parseResponse(err, resp, body);
         callback(msg);
       });
    } else {
      callback(msg);
    }
  });
}

function replicateMonocles(couch, target, callback) {
  var replication = {"source":"http://glitterbacon.couchone.com/couchappspora","target":couch + "/" + target, "doc_ids":["_design/couchappspora"]};
  request({method: "POST", uri:couch + '/_replicate', body: JSON.stringify(replication), headers:headers}, callback)
}

function ensureParams(params, req) {
  var missing = false;
  params.forEach(function(param) {
    if ( req.body[param] === "" ) {
      missing = {"error" : "missing_params", "reason": "Missing parameters. Please fill out the required fields"};
    }
  })
  return missing;
}

var app = express.createServer();

app.configure(function() {
  app.use(express.favicon());
  app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-timems'));
  app.set("views", __dirname + "/public/pages");
  app.use(express.static(__dirname + '/public'));
  app.set("view options", {layout: false});
  app.register(".html", mustacheWrapper);
  app.use(express.bodyParser());
  app.use(express.errorHandler({
    dumpExceptions:true, 
    showStack:true
  }));
});

app.get("/", function(req, res) {
  res.render("index.html");
});

app.post("/provision", function(req, res) {
  var missing = ensureParams(['username', 'password', 'url'], req);
  if (missing) {
    res.send(missing);
  } else {
    var couch = "http://" + req.body.username + ":" + req.body.password + "@" + req.body.url;
    var target = "monocles";
    createDb(target, couch, 
      function (msg) {
        if (msg.error) {
          res.send(msg);
        } else if (msg.db_name || msg.ok) {
          replicateMonocles(couch, target, 
            function (err, resp, body) {
              res.send(parseResponse(err, resp, body));
              // TODO PUT http://admin:password@couch:5984/_config/vhosts/domainname -d '"/monocles/_design/couchappspora/_rewrite"'
            }
          )
        }
      }
    )
  }
});

var port = 3000;
app.listen(port);
console.log('Started on port \x1b[33m' + port + '\x1b[0m');