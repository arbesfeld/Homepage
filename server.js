var validIds = {};

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    site = require('./site')(validIds);

server.listen(3000);

// Config

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));

// General

app.get('/', site.index);
app.get('/favicon.ico', site.icon);
app.get('/:id', site.load);

// Sockets

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
