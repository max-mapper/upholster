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
  console.log(sys.inspect(req.body))
  res.send(req.body.username);
  // var monocles = "http://glitterbacon.couchone.com/couchappspora/_design/couchappspora"
  // curl -X POST http://YOURCOUCH/_replicate -d '{"source":"http://max.couchone.com/apps","target":"apps", "doc_ids":["_design/push"]}'
});

var port = 3000;
app.listen(port);
console.log('Started on port \x1b[33m' + port + '\x1b[0m');