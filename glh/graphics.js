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

    function draw(camera, objects) {
        glh.resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var fovy = 45;
        var mProjection = m4.perspective(fovy, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.001, 200);

        var mCamera = m4.identity();
        m4.translate(mCamera, camera.position, mCamera);
        m4.rotateY(mCamera, camera.yaw, mCamera);
        m4.rotateX(mCamera, camera.pitch, mCamera);
        var mView = m4.inverse(mCamera);
        var mEye = m4.multiply(mProjection, mView);

        var mModel = m4.identity();
        var mNormal = m4.identity();

        gl.useProgram(shader.program);
        gl.uniformMatrix4fv(shader.uniforms.u_eye, false, mEye);
        gl.uniform3fv(shader.uniforms.u_light, new Float32Array([1.0, -1.0, 1.0]));

        gl.bindVertexArray(models.cube.vao);

        objects.cubes.forEach(function(cube) {
            m4.identity(mModel);
            m4.translate(mModel, cube.position, mModel);
            //m4.scale(mModel, [0.7, 1.0, 0.7], mModel);
            m4.inverse(mModel, mNormal);
            m4.transpose(mNormal, mNormal);

            gl.uniformMatrix4fv(shader.uniforms.u_model, false, mModel);
            gl.uniformMatrix4fv(shader.uniforms.u_normal, false, mNormal);
            gl.uniform4fv(shader.uniforms.u_color, new Float32Array(cube.color));
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        });

        gl.bindVertexArray(models.octahedron.vao);

        objects.bullets.forEach(function(bullet) {
            m4.identity(mModel);
            m4.translate(mModel, bullet.position, mModel);
            m4.rotateY(mModel, bullet.yaw, mModel);
            m4.rotateZ(mModel, Date.now() / 400, mModel);
            //m4.scale(mModel, [0.4, 0.4, 0.4], mModel);
            m4.inverse(mModel, mNormal);
            m4.transpose(mNormal, mNormal);

            gl.uniformMatrix4fv(shader.uniforms.u_model, false, mModel);
            gl.uniformMatrix4fv(shader.uniforms.u_normal, false, mNormal);
            gl.uniform4fv(shader.uniforms.u_color, new Float32Array(bullet.color));
            gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);
        });

        gl.bindVertexArray(null);
    }

    function loadModels() {
        models.cube = loadModel(gl, res.objs.cube);
        models.octahedron = loadModel(gl, res.objs.octahedron);
    }

    function loadModel(gl, objText) {
        var obj = parseOBJ(objText);

        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var buffers = {
            position: glh.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(obj.positions)),
            normal: glh.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(obj.normals)),
            indices: glh.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices)),
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(shader.attributes.a_position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(shader.attributes.a_normal, 3, gl.FLOAT, false, 0, 0);

        glh.enableVertexAttributeArrays(gl, shader.attributes);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        gl.bindVertexArray(null);

        return {
            vao: vao,
            nVertices: obj.positions.length
        };
    }
    
    function parseOBJ(str) {
        var positions = [];
        var normals = [];
        var indices = [];
        var lines = str.split('\n');
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
        return {
            positions: positions,
            normals: normals,
            indices: indices
        };
    }

    return {
        // functions
        init: init,
        draw: draw,

        // vars
        canvas: gl.canvas,
    };

})();