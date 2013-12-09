var parse = require("../server_js/poem/parser").parse;
var searchPoem = require("../server_js/poem/poem-search").searchPoem;
var listener = require("../server_js/poem/listener");

exports.get = function(req, res, next) {
  res.render('poem/essay', { title:"Poem" });
};

exports.post = function(req, res, next) {
  var input = listener.preProcess(req.body.input);
  var parsed = parse(input);
  var model = listener.evaluate(parsed);
  var poemName = model.title;
  var poemArtist = model.artist;
  var qtips = model.qtips;

  var cbSuccess = function(title, artist, lyrics) {
 // res.render('poem/poem', { title:title, artist:artist, lyrics:lyrics, qtips:qtips} );
    res.send({title:title, artist:artist, lyrics:lyrics.trim(), qtips:qtips});
  };

  var cbFail = function(err) {
    console.log("Error! " + err);
    res.send({title:"Error", artist:err, lyrics:"", qtips:{}});
  };

  if (!poemName) {
    cbFail(new Error("Poem name not found. Help us out?"));
  }

  var query = poemName;
  if (poemArtist) {
    query = poemArtist + " " + poemName;
  }

  console.log(query);
  if (query.charAt(0) == "W") {
    cbSuccess("When I have fears that I may cease to be", "John Keats", whenLyrics);
  }
  // searchPoem(query, cbSuccess, cbFail);
};

var whenLyrics = "When I have fears that I may cease to be\n" +
"Before my pen has glean'd my teeming brain,\n" +
"Before high pil`d books, in charact'ry,\n" +
"Hold like rich garners the full-ripen'd grain;\n" +
"When I behold, upon the night's starr'd face,\n" +
"Huge cloudy symbols of a high romance,\n" +
"And feel that I may never live to trace\n" +
"Their shadows, with the magic hand of chance;  \n" +
"And when I feel, fair creature of an hour!\n" +
"That I shall never look upon thee more,\n" +
"Never have relish in the faery power\n" +
"Of unreflecting love;—then on the shore\n" +
"Of the wide world I stand alone, and think,\n" +
"Till Love and Fame to nothingness do sink.\n";