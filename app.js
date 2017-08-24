var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

var world = require('./server/world');
var comm = require('./server/comm')(io, world);
comm.startBroadcasting();

world.startLoop();

http.listen(3000, function() {
	console.log('listening on *:3000');
});