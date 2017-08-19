var GameState = {
	outOfFocus: 0,
	inFocus: 1
};

var game = {
	events: {},
	state: GameState.outOfFocus,
	input: {
		keyStates: {
			w: false,
			a: false,
			s: false,
			d: false,
			q: false,
			e: false,
		},
		mouse: {
			x: 0.0, y: 0.0
		},
		mouseSensitivity: 0.001
	},
	camera: {
		x: 0.0,
		y: -2.0,
		z: -16.0,
		pitch: 0.0,
		yaw: 0.0,
	},
	cubes: [],
	players: [],
};

var playerSpeed = 0.1;

// cubes!

game.initWorld = function () {
	game.cubes = [];

	var greens = [];
	for (var i = 0; i < 8; i++) {
		var a = 0.8 + Math.random() * 0.2;
		greens.push([0.2, 1.0 * a, 0.5 * a]);
	}

	for (var y = 0; y <= 0; y++) {
		for (var x = -20; x <= 20; x++) {
			for (var z = -20; z <= 20; z++) {
				game.cubes.push({
					pos: new vector3(x, y + Math.floor(Math.random() * 3) / 6, z),
					color: greens[Math.floor(Math.random() * greens.length)]
				});
			}
		}
	}

	game.players = [];
	for (var i = 0; i < 10; i++) {
		game.players.push(new player(new vector3(Math.random() * 40 - 20, 1, Math.random() * 40 - 20), 0.4 * Math.random(),Math.random() * 2 * Math.PI));
	}
};

game.events.keyDown = function(event) {
	if (pointerLock.havePointerLock && game.state == GameState.outOfFocus) {
		pointerLock.activate(renderer.canvas);
	}
	if (event.keyCode == 87) {
		game.input.keyStates.w = true;
	}
	else if (event.keyCode == 65) {
		game.input.keyStates.a = true;
	}
	else if (event.keyCode == 83) {
		game.input.keyStates.s = true;
	}
	else if (event.keyCode == 68) {
		game.input.keyStates.d = true;
	}
	else if (event.keyCode == 81) {
		game.input.keyStates.q = true;
	}
	else if (event.keyCode == 69) {
		game.input.keyStates.e = true;
	}
};

game.events.keyUp = function(event) {
	if (event.keyCode == 87) {
		game.input.keyStates.w = false;
	}
	else if (event.keyCode == 65) {
		game.input.keyStates.a = false;
	}
	else if (event.keyCode == 83) {
		game.input.keyStates.s = false;
	}
	else if (event.keyCode == 68) {
		game.input.keyStates.d = false;
	}
	else if (event.keyCode == 81) {
		game.input.keyStates.q = false;
	}
	else if (event.keyCode == 69) {
		game.input.keyStates.e = false;
	}
};

game.events.mouseMove = function(event) {
	if (game.state == GameState.inFocus) {
		game.camera.yaw += event.movementX * game.input.mouseSensitivity;

		game.camera.pitch += event.movementY * game.input.mouseSensitivity;
		if (game.camera.pitch > Math.PI / 2.0) {
			game.camera.pitch = Math.PI / 2.0;
		}
		else if (game.camera.pitch < -Math.PI / 2.0) {
			game.camera.pitch = -Math.PI / 2.0;
		}
	}
};

game.events.pointerLockChange = function() {
	if (pointerLock.isActive(renderer.canvas)) {
		game.state = GameState.inFocus;
		console.log('infocus');
	} else {
		game.state = GameState.outOfFocus;
	}
};

game.addEventListeners = function() {
	document.addEventListener('keydown', this.events.keyDown);
	document.addEventListener('keyup', this.events.keyUp);
	document.addEventListener('mousemove', this.events.mouseMove);
	document.addEventListener('pointerlockchange', this.events.pointerLockChange);
};

game.cameraMove = function() {
	if (game.input.keyStates.w) {
		game.camera.x -= Math.sin(game.camera.yaw) * playerSpeed;
		game.camera.z += Math.cos(game.camera.yaw) * playerSpeed;
	}
	if (game.input.keyStates.a) {
		game.camera.x += Math.cos(game.camera.yaw) * playerSpeed;
		game.camera.z += Math.sin(game.camera.yaw) * playerSpeed;
	}
	if (game.input.keyStates.s) {
		game.camera.x += Math.sin(game.camera.yaw) * playerSpeed;
		game.camera.z -= Math.cos(game.camera.yaw) * playerSpeed;
	}
	if (game.input.keyStates.d) {
		game.camera.x -= Math.cos(game.camera.yaw) * playerSpeed;
		game.camera.z -= Math.sin(game.camera.yaw) * playerSpeed;
	}
	if (game.input.keyStates.q) {
		game.camera.y += playerSpeed;
	}
	if (game.input.keyStates.e) {
		game.camera.y -= playerSpeed;
	}

	game.players[0].pitch += 0.1;
};

game.gameLoop = function loop() {
	requestAnimationFrame(loop); // recurse

	game.cameraMove();
	//draw(game.camera, game.cubes, game.players);
};

(function() {

	renderer.init();
	game.addEventListeners();
	game.initWorld();
	game.gameLoop();

})();