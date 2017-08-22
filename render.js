"use strict";

var renderer = (function() {



})();

twgl.setDefaults({attribPrefix: "a_"});
var m4 = twgl.m4;
var v3 = twgl.v3;

var gl = twgl.getContext(document.getElementById("canvas"));
var programInfo = createProgram(gl, shader.vs, shader.fs);

// Shared values
var lightDirection = [1, -1, 1];

var view_matrix = m4.identity();

var uniforms = {
	u_light: lightDirection,
	u_color: [0, 0.5, 1],
};

var vao = createVAOfromOBJ(objs.cube);

function render(time) {
	twgl.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var fovy = 30 * Math.PI / 180;
	var projection = m4.perspective(fovy, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 200);

	uniforms.u_model = m4.identity();
	uniforms.u_view = m4.identity();
	uniforms.u_projection = projection;
	uniforms.u_normal = m4.identity();

	twgl.setUniforms(programInfo, uniforms);

	gl.useProgram(programInfo);
	gl.bindVertexArray(vao);
	gl.drawElements(renderer.gl.TRIANGLES, 36, renderer.gl.UNSIGNED_SHORT, 0);
	gl.bindVertexArray(null);

	//requestAnimationFrame(render);
}
requestAnimationFrame(render);

function createVAOfromOBJ(objText) {
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
	
	var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
	var vao = twgl.createVAOFromBufferInfo(gl, setters, bufferInfo);
	return vao;
}

function createProgram(gl, vsText, fsText) {
	// create a program.
	var program = gl.createProgram();

	// attach the shaders.
	gl.attachShader(program, compileShader('vs', vsText));
	gl.attachShader(program, compileShader('fs', fsText));

	// link the program.
	gl.linkProgram(program);

	// Check if it linked.
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		console.log("Program link fail.");
		console.log(gl.getProgramInfoLog (program));
	}
 
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

	return program;
};