var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    site = require('./site')(io);

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
app.get('/kiwi', site.kiwi);
app.get('/tilt', site.tiltGame);
app.get('/tilt/:id', site.tiltGameClient);
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));

