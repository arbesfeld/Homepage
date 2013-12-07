var parse = require("../server_js/poem/parser").parse;
var searchPoem = require("../server_js/poem/poem-search").searchPoem;
var listener = require("../server_js/poem/listener");

exports.get = function(req, res, next) {
  res.render('poem/essay', { title:"Poem" });
};

exports.post = function(req, res, next) {

  var cbSuccess = function(title, artist, lyrics) {
    res.render('poem/poem', { layout:false, title:title, artist:artist, lyrics:lyrics} );
  };

  var cbFail = function(err) {
    console.log("Error!");
    res.send("Error: " + err);
  };

  var input = listener.preProcess(req.body.input);
  var parsed = parse(input);
  var poemName = listener.getPoemName(parsed);
  console.log("poem name:" + poemName);

  if (!poemName) {
    cbFail(new Error("Poem name not found. Help us out?"));
  }

  searchPoem(poemName, cbSuccess, cbFail);
};