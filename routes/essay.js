var parse = require("../server_js/poem/parser").parse;
var searchPoem = require("../server_js/poem/poem-search").searchPoem;
var listener = require("../server_js/poem/listener");
var superAgent = require('rapgenius-js/node_modules/superagent');

var WIKI_API = "http://en.wikipedia.org/w/api.php?";

exports.get = function(req, res, next) {
  res.render('poem/essay', { title:"Poem" });
};

exports.search = function(req, res, next) {
  console.log(req.body);
  var string = req.body.string;
        // action:"query",
      // prop:"extracts",
      // exintro:true,
      // format:"xml",
      // titles:curAnalysis.urlText

  var getWiki = function (string, callback) {
    superAgent.get(WIKI_API)
      .query({action:"query", prop:"extracts", exintro:true, titles:string.trim().replace( /"/g, ""), format:"json"})
      .set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
      .end(function (res) {
        if (res.ok) {
          var result = eval('(' + res.text + ')');
          var content = "";
          if (result.query.hasOwnProperty('pages')) {
            var pages = result.query.pages;

            for (var page in pages) {
              var res = pages[page]
              content += res.extract;
            }
          }
          if (result instanceof Error) {
            return callback(content);
          } else {
            return callback(null, content)
          }
        } else {
          console.log("Received a non expected HTTP status [status=" + res.status + "]");
          return callback(new Error("Unexpected HTTP status: " + res.status));
        }
      });
  }
  getWiki(string, function(err, result) {
    res.send(result);
  });
};

exports.post = function(req, res, next) {
  var input = listener.preProcess(req.body.input);
  var debug = input.substring(0, 9);
  var debugOn = false;
  if (debug.substring(0, 7) === "<debug=") {
    debugOn = true;
    input = input.substring(9);
    debug = debug.charAt(7);
  }
  var parsed = parse("\t" + input.trim());

  var model = listener.evaluate(parsed);
  var poemName = model.title;
  var poemArtist = model.artist;
  var qtips = model.qtips;
  var par1 = model.par1;
  var cbSuccess = function(title, artist, lyrics) {
 // res.render('poem/poem', { title:title, artist:artist, lyrics:lyrics, qtips:qtips} );
    res.send({title:title, artist:artist, lyrics:lyrics.trim(), qtips:qtips, par1:par1});
  };

  var cbFail = function(err) {
    console.log("Error! " + err);
    res.send({title:"Error", artist:err, lyrics:"", qtips:{}});
  };




  if (debugOn) {
    if (debug == "k") {
      console.log("Debug keats");
      cbSuccess("When I have fears that I may cease to be", "John Keats", whenLyrics);
    }
    if (debug == "m") {
      console.log("Debug dancer");
      cbSuccess("The Harlem Dancer", "Claude McKay", dancerLyrics);
    }
  } else {
    var query = poemName;
    console.log(query);
    if (!poemName) {
      cbFail(new Error("Poem name not found. Help us out?"));
    }
    if (poemArtist) {
      query = poemArtist + " " + poemName;
    }
    searchPoem(query, cbSuccess, cbFail);
  }
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

var dancerLyrics = "APPLAUDING youths laughed with young prostitutes"
"And watched her perfect, half-clothed body sway;" +
"Her voice was like the sound of blended flutes" +
"Blown by black players upon a picnic day." +
"She sang and danced on gracefully and calm," +
"The light gauze hanging loose about her form;" +
"To me she seemed a proudly-swaying palm" +
"Grown lovelier for passing through a storm." +
"Upon her swarthy neck black, shiny curls" +
"Profusely fell; and, tossing coins in praise," +
"The wine-flushed, bold-eyed boys, and even the girls," +
"Devoured her with their eager, passionate gaze;" +
"But, looking at her falsely-smiling face" +
"I knew her self was not in that strange place.";