
module.exports = function(app, io) {

  var main = require('./main');
  app.get('/', main.get);

  var kiwi = require('./kiwi');
  app.get('/kiwi', kiwi.get);

  var poem = require('./poem');
  app.get('/poem', poem.get);
  app.post('/poem', poem.post);

  var tilt = require('./tilt')(io);
  app.get('/tilt', tilt.get);
  app.get('/tilt/:id', tilt.getTiltClient);

};
