var rapgeniusClient = require("rapgenius-js");

function lyricsSearchCb(err, lyrics){
    if(err) {
      console.log("Error: " + err);
    } else {
      console.log("**** LYRICS *****\n%s", lyrics.getFullLyrics(true));
    }
};

function searchCallback(err, songs){
  if(err) {
    console.log("Error: " + err);
  } else {
    if(songs.length > 0){
      //We have some songs
      rapgeniusClient.searchSongLyrics(songs[0].link, lyricsSearchCb);
    }
  }
};

rapgeniusClient.searchSong("Liquid Swords", searchCallback);