var graphics = (function() {
    var m4 = twgl.m4; // TODO: find another matrix lib that doesn't carry twgl with it

    var gl = glh.getContext(document.getElementById("canvas"));
    var shader = {};
    var models = {};

    function init() {
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 1.0, 0.5, 1.0);
        initShader();
        loadModels();
    }

    function initShader() {
        shader.program = glh.createProgram(gl, res.shader.vs, res.shader.fs);
        shader.uniforms = glh.getUniformLocations(gl, shader.program);
        shader.attributes = glh.getAttributeLocations(gl, shader.program);
    }

    function draw() {
        glh.resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var fovy = 45;
        var projection = m4.perspective(fovy, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 200);

        var camera = m4.identity();
        m4.translate(camera, [1, 2, 6], camera);

        var view = m4.inverse(camera);
        var eye = m4.multiply(projection, view);

        gl.useProgram(shader.program);
        gl.bindVertexArray(models.cube);

        gl.uniformMatrix4fv(shader.uniforms.u_model, false, m4.identity());
        gl.uniformMatrix4fv(shader.uniforms.u_eye, false, eye);
        gl.uniformMatrix4fv(shader.uniforms.u_normal, false, m4.identity());
        gl.uniform4fv(shader.uniforms.u_color, new Float32Array([1.0, 0.0, 0.5, 1.0]));
        gl.uniform3fv(shader.uniforms.u_light, new Float32Array([1.0, -1.0, 1.0]));

        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

        gl.bindVertexArray(null);
    }

    function loadModels() {
        models.cube = loadModel(gl, res.objs.cube);
    }

    function loadModel(gl, objText) {
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
					indices.push(parseInt(words[1]));
					indices.push(parseInt(words[2]));
					indices.push(parseInt(words[3]));
				}
			}
        });

        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var buffers = {
            position: glh.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(positions)),
            normal: glh.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)),
            indices: glh.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)),
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(shader.attributes.a_position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(shader.attributes.a_normal, 3, gl.FLOAT, false, 0, 0);

        glh.enableVertexAttributeArrays(gl, shader.attributes);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        gl.bindVertexArray(null);

        return vao;
	}

    return {
        init: init,
        draw: draw,
    };

})();

graphics.init();
graphics.draw();