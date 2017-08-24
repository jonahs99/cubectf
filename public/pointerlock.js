var pointerLock = {
    havePointerLock:   ('pointerLockElement' in document ||
                        'mozPointerLockElement' in document ||
                        'webkitPointerLockElement' in document),
    activate: function(canvas) {
        canvas.requestPointerLock = canvas.requestPointerLock ||
                                    canvas.mozRequestPointerLock ||
                                    canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
    },
    release: function() {
        document.exitPointerLock =  document.exitPointerLock ||
								    document.mozExitPointerLock ||
								    document.webkitExitPointerLock;
	    document.exitPointerLock();
    },
    isActive: function(canvas) {
        return document.pointerLockElement === canvas;
    }
};