var renderer = {

	canvas: null,
	gl: null,

};

renderer.init = function() {
	renderer.canvas = document.getElementById('game-surface');
    
    try {
        renderer.gl = renderer.canvas.getContext("webgl2");
        renderer.resize();
    } catch (e) {
    	console.log(e);
    }

    if (!renderer.gl) {
        alert("Could not initialise WebGL, sorry :-(. Try a more modern browser.");
        return false;
    }

    renderer.gl.clearColor(0.15, 0.15, 0.15, 1.0);
    renderer.gl.enable(renderer.gl.DEPTH_TEST);

    return true;
};

renderer.initShader = function() {
	renderer.flatShader = new shader(renderer.gl,
	`#version 300 es
	attribute vec3 aVertexPosition;
	attribute vec3 aVertexNormal;
	attribute vec3 aVertexColor;

	uniform mat4 uMMatrix;
	uniform mat4 uVMatrix;
	uniform mat4 uPMatrix;
	uniform mat4 uNormalMatrix;

	varying lowp vec4 vColor;

	void main(void) {
	    vec3 light = normalize(vec3(-2.0, 4.0, -1.0));
	    vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
	    float ambient = 0.8;
	    float directional = max(0.5 + dot(transformedNormal.xyz, light), 0.0) / 1.5 * (1.0 - ambient);
	    float brightness = directional + ambient;

	    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
	    vColor = vec4(brightness * aVertexColor, 1.0);
	}
	`,
	`#version 300 es
	varying lowp vec4 vColor;
	uniform lowp vec4 uTint;
	void main(void) {
	    gl_FragColor = vColor * uTint;
	}
	`
	);
}

renderer.resize = function() {
	renderer.canvas.width = window.innerWidth;
    renderer.canvas.height = window.innerHeight;
    renderer.gl.viewportWidth = renderer.canvas.width;
    renderer.gl.viewportHeight = renderer.canvas.height;
    renderer.calculatePerspectiveMatrix();
};

renderer.calculatePerspectiveMatrix = function() {
	mat4.perspective(45, renderer.gl.viewportWidth / renderer.gl.viewportHeight, 0.1, 100.0, renderer.perspectiveMatrix);
};