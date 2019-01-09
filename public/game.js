var game = (function() {

    var GameState = {
	    login: 0,
        playing: 1,
    };

    var state = GameState.login;
    var inFocus = false;

    var frame = 0;
    var lastUpdateMs = 0;
    var fpsDisp = false;
    var fpsTimer = Date.now();

    var serverUpdateMs = 0;

    var world = {
        staticObjects: null,
        currentObjects: null,
        lastObjects: null,
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
        looking: {
            pitch: 0.0,
            yaw: 0.0
        },
		mouseSensitivity: 0.001
	};

    var playerId = -1;

    function initWorld() {

    }

    function gameLoop() {
        var playerSpeed = 0.1;

        graphics.draw(world, getFrameDelta(), input.looking, playerId);

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

    function start(updateMs) {
        serverUpdateMs = updateMs;
        requestAnimationFrame(gameLoop);
    }

    function toggleFPS() {
        fpsDisp = !fpsDisp;
    }

    function getFrameDelta() {
        return clamp((Date.now() - lastUpdateMs) / serverUpdateMs, 0, 1);
    }

    // Server-stuff

    function setStatic(objects) {
        world.staticObjects = objects;
    }

    function setObjects(objects) {
        world.lastObjects = world.currentObjects;
        world.currentObjects = objects;
        lastUpdateMs = Date.now();
    }

    function playerJoin(id) {
        playerId = id;
    }

    function getInput() {
        return input;
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
            if (inFocus) {
                input.looking.yaw -= event.movementX * input.mouseSensitivity;
                input.looking.pitch -= event.movementY * input.mouseSensitivity;
                if (input.looking.pitch > Math.PI / 2.0) {
                    input.looking.pitch = Math.PI / 2.0;
                }
                else if (input.looking.pitch < -Math.PI / 2.0) {
                    input.looking.pitch = -Math.PI / 2.0;
                }
            }
        };

        function mouseDown(event) {
            if (pointerLock.havePointerLock && !inFocus) {
                if (Math.abs(event.clientX - graphics.canvas.width / 2) + Math.abs(event.clientY - graphics.canvas.height / 2) < 200) {
                    pointerLock.activate(graphics.canvas);
                }
            }
        };

        function pointerLockChange() {
            inFocus = pointerLock.isActive(graphics.canvas);
        };
    }

    return {
        addEventListeners: addEventListeners,
        initWorld: initWorld,
        start: start,

        setStatic: setStatic,
        setObjects: setObjects,
        playerJoin: playerJoin,
        getInput: getInput,

        gameLoop: gameLoop,
        toggleFPS: toggleFPS,
    };

})();