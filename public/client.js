var client = (function() {

	var socket = io();

	socket.on('player', onPlayer);
	socket.on('snapshot', onSnapshot);

	// Incoming

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