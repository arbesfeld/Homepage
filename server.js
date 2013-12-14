/**
 * Module dependencies.
 */
var express = require('express');
var fs = require('fs');
var path = require('path');
var httpProxy = require('http-proxy');
var config_file = require('yaml-config');

exports = module.exports = config = config_file.readConfig('config/apps.yml');
exports = module.exports = appPath = __dirname;

// Redirect app
var redirect = express();

redirect.all('*', function(req, res){
  res.redirect(config.baseURL + '/' + req.subdomains[0]);
});

// Main app
var app = express();
app.use("/public", express.static(__dirname + '/public'));

var proxy = new httpProxy.RoutingProxy();

for (var prog in config.apps) {
  var cur = config.apps[prog];

  var newApp = module.exports = express();
  newApp.set('name', cur.name);
  require('./bootstrap').init(newApp);

  var proxySettings = {
    host: 'localhost',
    port: cur.port,
    path: cur.path
  };

  (function(proxySettings) {
    app.get(cur.path + "*", function (req, res) {
      return proxy.proxyRequest(req, res, proxySettings);
    });

    app.post(cur.path + "*", function (req, res) {
      return proxy.proxyRequest(req, res, proxySettings);
    });
  })(proxySettings);

  newApp.listen(cur.port);
  console.log("Starting server " + cur.name + " on port " + cur.port + " with path " + cur.path + ".");
};

app.listen(3000, function() {
  console.log("Express server listening on port %d in %s mode", 3000 /*app.address().port*/, app.settings.env);
});
