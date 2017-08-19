var shaderSource = {};

shaderSource["shader-vs"] = {
	type: 'x-shader/x-vertex',
    text: `	attribute vec3 aVertexPosition;
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
			}`
};

shaderSource["shader-fs"] = {
	type: 'x-shader/x-fragment',
    text: `	varying lowp vec4 vColor;
            uniform lowp vec4 uTint;
			void main(void) {
				gl_FragColor = vColor * uTint;
			}`
};

function getShader(gl, id) {
    var shaderScript = shaderSource[id];
    if (!shaderScript) {
        return null;
    }

    var str = shaderScript.text;

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}