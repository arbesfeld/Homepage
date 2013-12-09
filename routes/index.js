
module.exports = function(app, io) {

  var main = require('./main');
  app.get('/', main.get);

  var kiwi = require('./kiwi');
  app.get('/kiwi', kiwi.get);

  var essay = require('./essay');
  app.get('/poem', essay.get);
  app.post('/poem/search', essay.search);
  app.post('/poem', essay.post);

  var tilt = require('./tilt')(io);
  app.get('/tilt', tilt.get);
  app.get('/tilt/:id', tilt.getTiltClient);

};
