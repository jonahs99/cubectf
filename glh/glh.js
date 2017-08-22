// Our custom webgl2 helper class
// Borrows a lot of ideas from twgl but without any excess

var glh = (function() {

	function getContext(canvas) {
		var context = canvas.getContext("webgl2");
		return context;
	}

	function resize(canvas) {
		var displayWidth  = canvas.clientWidth;
		var displayHeight = canvas.clientHeight;
		if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
			canvas.width  = displayWidth;
			canvas.height = displayHeight;
		}
	}

	function compileShader(gl, type, str) {
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

	function createProgram(gl, vsText, fsText) {
		var program = gl.createProgram();
		gl.attachShader(program, compileShader(gl, 'vs', vsText));
		gl.attachShader(program, compileShader(gl, 'fs', fsText));
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.log("Program link fail.");
			console.log(gl.getProgramInfoLog (program));
		}
		return program;
	};

	function getUniformLocations(gl, program) {
		var locations = {};
		var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (var i = 0; i < numUniforms; i++) {
			var uniformInfo = gl.getActiveUniform(program, i);
			if (!uniformInfo) {
				break;
			}
			var name = uniformInfo.name;
			locations[name] = gl.getUniformLocation(program, name);
		}
		return locations;
	}

	function getAttributeLocations(gl, program) {
		var locations = {};
		var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (var i = 0; i < numAttributes; i++) {
			var attributeInfo = gl.getActiveAttrib(program, i);
			if (!attributeInfo) {
				break;
			}
			var name = attributeInfo.name;
			locations[name] = gl.getAttribLocation(program, name);
		}
		return locations;
	}

	function enableVertexAttributeArrays(gl, attributeLocations) {
		for (var name in attributeLocations) {
			gl.enableVertexAttribArray(attributeLocations[name]);
		}
	}

	function createBuffer(gl, type, array) {
		var buffer = gl.createBuffer();
    	gl.bindBuffer(type, buffer);
		gl.bufferData(type, array, gl.STATIC_DRAW);
		return buffer;
	}

	return {
		getContext: getContext,
		resize: resize,
		compileShader: compileShader,
		createProgram: createProgram,
		getUniformLocations: getUniformLocations,
		getAttributeLocations: getAttributeLocations,
		enableVertexAttributeArrays: enableVertexAttributeArrays,
		createBuffer: createBuffer,
	};
})();