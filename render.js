

var renderer = {

	canvas: null,
	gl: null,

	vaos: {cube: null},

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

    renderer.initVAOs();

    renderer.gl.clearColor(0.15, 0.15, 0.15, 1.0);
    renderer.gl.enable(renderer.gl.DEPTH_TEST);

    return true;
};

renderer.initShader = function() {
	renderer.flatShader = new shader(renderer.gl,
		`#version 300 es
		in vec3 a_position;
		in vec3 a_normal;

		uniform mat4 u_model;
		uniform mat4 u_view;
		uniform mat4 u_projection;
		uniform mat4 u_normal;
		uniform lowp vec4 u_color;
		uniform vec3 u_light;

		out lowp vec4 vColor;

		void main(void) {
		    vec4 transformedNormal = u_normal * vec4(u_view, 1.0);
		    float ambient = 0.8;
		    float directional = max(0.5 + dot(transformedNormal.xyz, u_light), 0.0) / 1.5 * (1.0 - ambient);
		    float brightness = directional + ambient;

		    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
		    vColor = brightness * u_color;
		}
		`,
		`#version 300 es
		in lowp vec4 vColor;
		
		void main(void) {
		    gl_FragColor = vColor;
		}
		`
		);
}

renderer.initVAOs = function() {
	renderer.vaos.cube = renderer.createVAOfromOBJ(cubeOBJ);
};

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

//							  \\
///							 \\\
//// 		Shader 			\\\\
///							 \\\
//							  \\

renderer.createVAOfromOBJ = function(objText) {
	var positions = [];
	var normals = [];
	var indices = [];

	var lines = objText.split('\n');
	lines.forEach(function(line) {
		var words = line.split(' ');
		if (words.length == 4) {
			if (words[0] == 'v') {
				positions.push(parseFloat(words[1]));
				positions.push(parseFloat(words[2]));
				positions.push(parseFloat(words[3]));
			}
			else if (words[0] == 'vn') {
				normals.push(parseFloat(words[1]));
				normals.push(parseFloat(words[2]));
				normals.push(parseFloat(words[3]));
			}
			else if (words[0] == 'f') {
				indices.push(parseFloat(words[1]));
				indices.push(parseFloat(words[2]));
				indices.push(parseFloat(words[3]));
			}
		}
	});

	var arrays = {
	   position: {numComponents: 3, data: positions},
	   normal: {numComponents: 3, data: normals},
	   indices: {numComponents: 3, data: indices},
	};
	
	var bufferInfo = twgl.createBufferInfoFromTypedArray(gl, arrays);
	var vao = twgl.createVAOFromBufferInfo(gl, setters, bufferInfo);
	return vao;
}

//
// Shader
//

function shader(gl, vsText, fsText) {
    this.vsText = vsText;
    this.fsText = fsText;

    this.vs = null;
    this.fs = null;

    this.program = this.compileShaders(gl);

    this.uniformSetters = twgl.createUniformSetters(gl, this.program);
    this.attributeSetters = twgl.createAttributeSetters(gl, this.program);
}

shader.prototype.compileShaders = function(gl) {
    this.vs = compileShader('vs', this.vsText);
    this.fs = compileShader('fs', this.fsText);

    function compileShader(type, str) {
        var shader = gl.createShader( {'vs': gl.VERTEX_SHADER, 'fs': gl.FRAGMENT_SHADER}[type] );
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log("Shader compile fail.");
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
};