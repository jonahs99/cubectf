// server world state
var utils = require('./utils');

function Player(id) {
	this.id = id;
	this.reserved = false;
	this.alive = false;

	this.position = [0, 0, 0];
	this.color = [0, 0, 0, 0];
	this.input = {
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
	};
}

function Cube(pos, color) {
	this.pos = pos;
	this.color = color;
}

var world = (function() {

	var frame = 0;
	var fpsTimer = Date.now();
	var tickMs = Math.floor(1000 / 40);
	var framesPerUpdate = 4;

	var size = [20, 20];
	var cubes = [];

	var nPlayers = 24;
	var players = [];

	function init() {
		for (var x = -(size[0] - 1) / 2; x <= (size[0] - 1) / 2; x++) {
			for (var z = -(size[1] - 1) / 2; z <= (size[0] - 1) / 2; z++) {
				cubes.push(new Cube([x, utils.randInt(-2, 3) * 0.1, z], [0, 0, 0, 0].map(function(a, i) { return i != 3 ? utils.rand(0.5, 1) : 1.0; }) ) );
			}
		}
		for (var i = 0; i < nPlayers; i++) {
			players.push(new Player(i));
		}
	}

	function createPlayer() {
		for (var i = 0; i < nPlayers; i++) {
			var player = players[i];
			if (!player.reserved) {
				player.reserved = true;
				player.alive = true;
				var x = utils.rand(-size[0] / 2, size[0] / 2);
				var z = utils.rand(-size[1] / 2, size[1] / 2);
				player.position = [x, 2.3, z];
				player.color = [0, 0.5, 1.0, 1.0];
				return i;
			}
		}
		return -1;
	}

	function removePlayer(id) {
		players[id].reserved = false;
	}

	function applyInput(playerId, input) {
		players[playerId].input = input;
	}

	function getStatic() {
		return {
			server: {
				updateMs: tickMs * framesPerUpdate,
			},
			world: {
				cubes: cubes,
			}
		};
	}

	function getSnapshot() {
		var playerSnapshots = players.map(function(player) {
			return {
				id: player.id,
				reserved: player.reserved,
				alive: player.alive,
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

	function startLoop(comm) {
		setInterval(gameLoop.bind(null, comm), tickMs);
	}

	function gameLoop(comm) {
		players.forEach(function(player) {
			var keyStates = player.input.keyStates;
			var yaw = player.input.looking.yaw;
			var playerSpeed = 0.3;
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

		frame++;
		if (frame % 100 == 0) {
			var now = Date.now();
			var ellapsed = now - fpsTimer;
			fpsTimer = now;
			//console.log("fps: " + Math.floor(ellapsed / 100));
		}
		if (frame % framesPerUpdate == 0) {
			comm.broadcastSnapshot();
		}
	};

	return {
		init: init,

		createPlayer: createPlayer,
		removePlayer: removePlayer,
		applyInput: applyInput,

		getStatic: getStatic,
		getSnapshot: getSnapshot,

		startLoop: startLoop,
	};

})();

module.exports = world;