var game = (function() {

    var GameState = {
	    outOfFocus: 0,
	    inFocus: 1
    };

    var state = GameState.outOfFocus;

    var frame = 0;
    var fpsDisp = false;
    var fpsTimer = Date.now();

    var objects = {
        cubes: [],
        players: [],
        bullets: []
    };

    var camera = {
        position: [0, 2, 0],
        pitch: 0,
        yaw: 0,
    };

    var input = {
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
	};

    function initWorld() {
        // Floor
        var floorWidth = 21; var floorHeight = 21;
        for (var x = -floorWidth / 2; x <= floorWidth / 2; x++) {
            for (var z = -floorWidth / 2; z <= floorWidth / 2; z++) {
                cube = {
                    position: [x, Math.floor(Math.random() * 4) / 4 * 0.25, z],
                    color: Array(3).fill(Math.random() * 0.1 + 0.3)
                };
                cube.color.push(1.0);
                objects.cubes.push(cube);
            }
        }
        //Bullets
        var nBullets = 50;
        for (var i = 0; i < nBullets; i++) {
            var x = -floorWidth / 2 + Math.floor(Math.random() * floorWidth);
            var z = -floorHeight / 2 + Math.floor(Math.random() * floorHeight);
            bullet = {
                position: [x, 2, z],
                color: [1.0, 0, 0.5, 1.0],
                yaw: Math.atan2(z, x)
            };
            objects.bullets.push(bullet);
        }
    }

    function gameLoop() {
        var playerSpeed = 0.1;

        if (input.keyStates.w) {
            camera.position[0] -= Math.sin(camera.yaw) * playerSpeed;
            camera.position[2] -= Math.cos(camera.yaw) * playerSpeed;
        }
        if (input.keyStates.a) {
            camera.position[0] -= Math.cos(camera.yaw) * playerSpeed;
            camera.position[2] += Math.sin(camera.yaw) * playerSpeed;
        }
        if (input.keyStates.s) {
            camera.position[0] += Math.sin(camera.yaw) * playerSpeed;
            camera.position[2] += Math.cos(camera.yaw) * playerSpeed;
        }
        if (input.keyStates.d) {
            camera.position[0] += Math.cos(camera.yaw) * playerSpeed;
            camera.position[2] -= Math.sin(camera.yaw) * playerSpeed;
        }
        if (input.keyStates.q) {
            camera.position[1] -= playerSpeed;
        }
        if (input.keyStates.e) {
            camera.position[1] += playerSpeed;
        }

        graphics.draw(camera, objects);

        frame++;
        if (frame % 30 == 0) {
            var now = Date.now();
            var ellapsed = now - fpsTimer;
            fpsTimer = now;
            if (fpsDisp) {
                console.log("fps: " + Math.floor(30 / ellapsed * 1000));
                fpsDisp = false;
            }
        }

        requestAnimationFrame(gameLoop);
    }

    function toggleFPS() {
        fpsDisp = !fpsDisp;
    }

    // Events
    function addEventListeners() {
        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mousedown', mouseDown);
        document.addEventListener('pointerlockchange', pointerLockChange);

        function keyDown(event) {
            if (event.keyCode == 87) {
                input.keyStates.w = true;
            }
            else if (event.keyCode == 65) {
                input.keyStates.a = true;
            }
            else if (event.keyCode == 83) {
                input.keyStates.s = true;
            }
            else if (event.keyCode == 68) {
                input.keyStates.d = true;
            }
            else if (event.keyCode == 81) {
                input.keyStates.q = true;
            }
            else if (event.keyCode == 69) {
                input.keyStates.e = true;
            }
        };

        function keyUp(event) {
            if (event.keyCode == 87) {
                input.keyStates.w = false;
            }
            else if (event.keyCode == 65) {
                input.keyStates.a = false;
            }
            else if (event.keyCode == 83) {
                input.keyStates.s = false;
            }
            else if (event.keyCode == 68) {
                input.keyStates.d = false;
            }
            else if (event.keyCode == 81) {
                input.keyStates.q = false;
            }
            else if (event.keyCode == 69) {
                input.keyStates.e = false;
            }
        };

        function mouseMove(event) {
            
            if (state == GameState.inFocus) {
                camera.yaw -= event.movementX * input.mouseSensitivity;
                camera.pitch -= event.movementY * input.mouseSensitivity;
                if (camera.pitch > Math.PI / 2.0) {
                    camera.pitch = Math.PI / 2.0;
                }
                else if (camera.pitch < -Math.PI / 2.0) {
                    camera.pitch = -Math.PI / 2.0;
                }
            }
        };

        function mouseDown(event) {
            if (pointerLock.havePointerLock && state == GameState.outOfFocus) {
                if (Math.abs(event.clientX - graphics.canvas.width / 2) + Math.abs(event.clientY - graphics.canvas.height / 2) < 100) {
                    pointerLock.activate(graphics.canvas);
                }
            }
        }

        function pointerLockChange() {
            if (pointerLock.isActive(graphics.canvas)) {
                state = GameState.inFocus;
            } else {
                state = GameState.outOfFocus;
            }
        };
    };

    return {
        addEventListeners: addEventListeners,
        initWorld: initWorld,
        gameLoop: gameLoop,
        toggleFPS: toggleFPS,
    };

})();

game.addEventListeners();

game.initWorld();
graphics.init();

requestAnimationFrame(game.gameLoop);