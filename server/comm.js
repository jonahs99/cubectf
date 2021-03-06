var comm = function(io, world) {

	var conns = {};

	io.on('connection', onConnection);
	
	function setSocketEvents(socket) {
		socket.on('disconnect', onDisconnect.bind(null, socket.id));
		socket.on('input', onInput.bind(null, socket));
	}

	function addConn(socket, playerId) {
		conns[socket.id] = {playerId: playerId};
	}

	function removeConn(id) {
		delete conns[id];
	}

	// Incoming

	function onConnection(socket) {
		setSocketEvents(socket);

		var playerId = world.createPlayer();

		sendStatic(socket);
		sendPlayerJoin(socket, playerId);

		addConn(socket, playerId);
	}

	function onDisconnect(id) {
		var conn = conns[id];
		world.removePlayer(conn.playerId);
		removeConn(id);
	}

	function onInput(socket, data) {
		var conn = conns[socket.id];
		if (!conn) {
			return;
		}
		world.applyInput(conn.playerId, data.input);
	}

	// Outgoing

	function sendPlayerJoin(socket, playerId) {
		socket.emit('player', {id: playerId});
	}

	function sendStatic(socket) {
		socket.emit('static', world.getStatic());
	}

	// Broadcast

	function broadcastSnapshot() {
		io.emit('snapshot', world.getSnapshot());
	}

	return {
		broadcastSnapshot: broadcastSnapshot,
	};

};

module.exports = comm;