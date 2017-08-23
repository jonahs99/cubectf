var graphics = (function() {
    var m4 = twgl.m4; // TODO: find another matrix lib that doesn't carry twgl with it
    var v3 = twgl.v3;

    var gl = glh.getContext(document.getElementById("canvas"));

    var shader = {};
    var models = {};

    // Global uniforms
    var mProjection = m4.identity();
    var vLight = v3.normalize(v3.create(3, 10, 5));

    // Pre-allocate for matrix computations
    var mCamera = m4.identity();
    var mView = m4.identity();
    var mEye = m4.identity();
    var mModel = m4.identity();
    var mNormal = m4.identity();

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

        gl.useProgram(shader.program);

        setEyeMatrix(camera);
        setDirectionalLight(vLight);

        drawCubes(objects.cubes);
        drawBullets(objects.bullets);
    }

    function setEyeMatrix(camera) {
        m4.perspective(45, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.001, 200, mProjection);
        m4.identity(mCamera);
        m4.translate(mCamera, camera.position, mCamera);
        m4.rotateY(mCamera, camera.yaw, mCamera);
        m4.rotateX(mCamera, camera.pitch, mCamera);
        m4.inverse(mCamera, mView);
        m4.multiply(mProjection, mView, mEye);
        gl.uniformMatrix4fv(shader.uniforms.u_eye, false, mEye);
    }

    function setDirectionalLight(lightDirection) {
        gl.uniform3fv(shader.uniforms.u_light, lightDirection);
    }

    function drawCubes(cubes) {
        gl.bindVertexArray(models.cube.vao);
        cubes.forEach(function(cube) {
            setModelTransformsT(cube.position);
            setModelColor(cube.color);
            drawModelElements(models.cube);
        });
        gl.bindVertexArray(null);
    }

    function drawBullets(bullets) {
        gl.bindVertexArray(models.octahedron.vao);
        bullets.forEach(function(bullet) {
            setModelTransformsTSR(bullet.position, [0.5, 0.5, 0.5], 0, bullet.yaw, Date.now() / 500);
            setModelColor(bullet.color);
            drawModelElements(models.octahedron);
        });
        gl.bindVertexArray(null);
    };

    function drawModelElements(model) {
        gl.drawElements(gl.TRIANGLES, model.nVertices, gl.UNSIGNED_SHORT, 0);
    }

    function setModelColor(color) {
        gl.uniform4fv(shader.uniforms.u_color, new Float32Array(color));
    }

    function setModelTransformsT(position) {
        m4.identity(mModel);
        m4.translate(mModel, position, mModel);

        m4.inverse(mModel, mNormal);
        m4.transpose(mNormal, mNormal);

        gl.uniformMatrix4fv(shader.uniforms.u_model, false, mModel);
        gl.uniformMatrix4fv(shader.uniforms.u_normal, false, mNormal);
    }

    function setModelTransformsTSR(position, scale, pitch, yaw, roll) {
        pitch = pitch || 0;
        yaw = yaw || 0;
        roll = roll || 0;

        m4.identity(mModel);
        m4.translate(mModel, position, mModel);
        m4.rotateY(mModel, yaw, mModel);
        m4.rotateZ(mModel, roll, mModel);
        m4.scale(mModel, scale, mModel);

        m4.inverse(mModel, mNormal);
        m4.transpose(mNormal, mNormal);

        gl.uniformMatrix4fv(shader.uniforms.u_model, false, mModel);
        gl.uniformMatrix4fv(shader.uniforms.u_normal, false, mNormal);
    };

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
            nVertices: obj.indices.length
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