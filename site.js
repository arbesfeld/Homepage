// Generate a random number string
function makeid() {
  var text = "";
  var possible = "0123456789";
  for (var i = 0; i < 3; ++i) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = function(io) {
  var validIds = {};
  setupSocket(io);

  return {
    index: function(req, res) {
      res.render('index');
    },

    tiltGame: function(req, res) {
      var id = makeid();
      validIds[id] = true;
      console.log(JSON.stringify(validIds));
      res.render('tiltGame', { idn: id });
    },

    tiltGameClient: function(req, res) {
      var id = req.params.id;
      if (validIds.hasOwnProperty(id)) {
        console.log(id + " is valid");
      } else {
        console.log(id + " is invalid");
      }
      res.render('tiltGameClient', { idn : id });
    },

    icon: function(req, res) {
    }
  };
};

function setupSocket(io) {
  io.sockets.on('connection', function (socket) {
    // received when a phone joins for the first time
    socket.on('phone-join', function (data) {
      console.log('Received client response from ' + data.id);
      io.sockets.emit('server-join', data);
    });

    // the website confirms the phone
    socket.on('web-joinResponse', function (data) {
      console.log('Received website response from ' + data.id);
      io.sockets.emit('server-joinResponse', data);
    });

    socket.on('phone-motion', function (data) {
      console.log('Received client motion from ' + data.id);
      io.sockets.emit('server-motion', data);
    });
  });
}