// server world state
var utils = require('./utils');

var world = (function() {

	var size = [20, 20];

	var players = [];

	function init() {

	}

	function createPlayer() {
		var x = utils.rand(-size[0] / 2, size[0] / 2);
		var z = utils.rand(-size[1] / 2, size[1] / 2);
		var player = {
			id: players.length,
		    position: [x, 2.3, z],
            color: [0, 0.5, 1.0, 1.0],
            input: {
            	keyStates: {
					w: false,
					a: false,
					s: false,
					d: false,
					q: false,
					e: false,
				},
		        looking: {
		            pitch: 0.0,
		            yaw: 0.0
		        }
		    },
		};
		players.push(player);
		return player.id;
	}

	function deletePlayer(id) {
		players.splice(id, 1);
	}

	function applyInput(playerId, input) {
		players[playerId].input = input;
	}

	function getSnapshot() {
		var playerSnapshots = players.map(function(player) {
			return {
				position: player.position,
				color: player.color,
				pitch: player.input.looking.pitch,
				yaw: player.input.looking.yaw
			};
		});
		return {
			players: playerSnapshots,
		};
	}

	function startLoop() {
		setInterval(gameLoop, 50);
	}

	function gameLoop() {
		players.forEach(function(player) {
			var keyStates = player.input.keyStates;
			var yaw = player.input.looking.yaw;
			var playerSpeed = 0.5;
			if (keyStates.w) {
	            player.position[0] -= Math.sin(yaw) * playerSpeed;
	            player.position[2] -= Math.cos(yaw) * playerSpeed;
	        }
	        if (keyStates.a) {
	            player.position[0] -= Math.cos(yaw) * playerSpeed;
	            player.position[2] += Math.sin(yaw) * playerSpeed;
	        }
	        if (keyStates.s) {
	            player.position[0] += Math.sin(yaw) * playerSpeed;
	            player.position[2] += Math.cos(yaw) * playerSpeed;
	        }
	        if (keyStates.d) {
	            player.position[0] += Math.cos(yaw) * playerSpeed;
	            player.position[2] -= Math.sin(yaw) * playerSpeed;
	        }
	        if (keyStates.q) {
	            player.position[1] -= playerSpeed;
	        }
	        if (keyStates.e) {
	            player.position[1] += playerSpeed;
	        }
		});
	};

	return {
		init: init,

		createPlayer: createPlayer,
		deletePlayer: deletePlayer,
		applyInput: applyInput,

		getSnapshot: getSnapshot,
		startLoop: startLoop,
	};

})();

module.exports = world;