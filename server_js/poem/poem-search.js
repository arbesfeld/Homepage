var rapgeniusClient = require("rapgenius-js");

function lyricsSearchCb(songName, artistName, cbSuccess, cbFail) {
  return function(err, lyrics){
    if (err) {
      cbFail(err);
    } else {
      cbSuccess(songName, artistName, lyrics.getFullLyrics(false));
    }
  };
};

function searchCallback(cbSuccess, cbFail) {
  return function(err, songs) {
    if (err) {
      cbFail(err);
    } else if (songs.length > 0) {
      rapgeniusClient.searchSongLyrics(songs[0].link,
        lyricsSearchCb(songs[0].name, songs[0].artists, cbSuccess, cbFail));
    }
  };
};

exports.searchPoem = function(poemName, cbSuccess, cbFail) {
  rapgeniusClient.searchSong(poemName, searchCallback(cbSuccess, cbFail));
};