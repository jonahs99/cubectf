var client = (function() {

	var socket = io();

	socket.on('static', onStatic);
	socket.on('player', onPlayer);
	socket.on('snapshot', onSnapshot);

	// Incoming

	function onStatic(data) {
		game.setStatic(data.world);
		game.start(data.server.updateMs);
	}

	function onPlayer(data) {
		game.playerJoin(data.id);
	}

	function onSnapshot(data) {
		game.setObjects(data);
	}

	// Outgoing

	function startBroadcasting() {
		setInterval(broadcastInput, 50);
	}

	function broadcastInput() {
		socket.emit('input', {input: game.getInput()});
	}

	return {
		startBroadcasting: startBroadcasting,
	};

})();