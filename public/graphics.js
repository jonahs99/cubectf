var graphics = (function() {
    var m4 = twgl.m4; // TODO: find another matrix lib that doesn't carry twgl with it
    var v3 = twgl.v3;

    var gl = glh.getContext(document.getElementById("canvas"));

    var staticShader = {};
    var modelShader = {};
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
        initShaders();
        loadModels();
    }

    function initShaders() {
        staticShader.program = glh.createProgram(gl, res.staticShader.vs, res.shader.fs);
        staticShader.uniforms = glh.getUniformLocations(gl, staticShader.program);
        staticShader.attributes = glh.getAttributeLocations(gl, staticShader.program);
        
        modelShader.program = glh.createProgram(gl, res.shader.vs, res.shader.fs);
        modelShader.uniforms = glh.getUniformLocations(gl, modelShader.program);
        modelShader.attributes = glh.getAttributeLocations(gl, modelShader.program);
    }

    function draw(objects, looking, playerId) {
        var player = objects.players[playerId];
        if (player) {
            var camera = {
                position: player.position,
                pitch: looking.pitch,
                yaw: looking.yaw
            };
        } else {
            var camera = {
                position: [0, 2.3, 0],
                pitch: looking.pitch,
                yaw: looking.yaw
            };
        }

        if (objects.cubes.length && !models.floor) {
            models.floor = generateStaticModel(objects.cubes);
            console.log(models.floor);
        }

        glh.resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        /*if (models.floor) {
            gl.useProgram(staticShader.program);
            setEyeMatrix(camera, staticShader);
            setDirectionalLight(vLight, staticShader);
            gl.bindVertexArray(models.floor.vao);
            drawModelElements(models.floor);
        }*/

        gl.useProgram(modelShader.program);
        setEyeMatrix(camera, modelShader);
        setDirectionalLight(vLight, modelShader);

        drawCubes(objects.cubes);
        drawPlayers(objects.players, playerId);
        drawBullets(objects.bullets);

        function drawCubes(cubes) {
            gl.bindVertexArray(models.cube.vao);
            cubes.forEach(function(cube) {
                m4.identity(mModel);
                setModelTransformsT(cube.position);
                setModelColor(cube.color);
                setTransformUniforms();
                drawModelElements(models.cube);
            });
            gl.bindVertexArray(null);
        }

        function drawPlayers(players, playerId) {
            gl.bindVertexArray(models.cube.vao);
            players.forEach(function(player, i) {
                m4.identity(mModel);
                setModelTransformsT([0, -0.8, 0]);
                setModelTransformsTSR(player.position, [0.65, 0.8, 0.5], [0, i == playerId ? looking.yaw : player.yaw, 0]);
                setModelColor(player.color);
                setTransformUniforms();
                drawModelElements(models.cube);

                if (i != playerId) {
                    m4.identity(mModel);
                    setModelTransformsTSR(player.position, [0.5, 0.5, 0.5], [player.pitch, player.yaw, 0]);
                    setModelColor(player.color);
                    setTransformUniforms();
                    drawModelElements(models.cube);
                }
            });
            gl.bindVertexArray(null);
        }

        function drawBullets(bullets) {
            gl.bindVertexArray(models.octahedron.vao);
            bullets.forEach(function(bullet) {
                m4.identity(mModel);
                setModelTransformsTSR(bullet.position, [0.5, 0.5, 0.5], [0, bullet.yaw, Date.now() / 500]);
                setModelColor(bullet.color);
                setTransformUniforms();
                drawModelElements(models.octahedron);
            });
            gl.bindVertexArray(null);
        };
    }

    function setEyeMatrix(camera, shader) {
        m4.perspective(45, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.001, 200, mProjection);
        m4.identity(mCamera);
        m4.translate(mCamera, camera.position, mCamera);
        m4.rotateY(mCamera, camera.yaw, mCamera);
        m4.rotateX(mCamera, camera.pitch, mCamera);
        m4.inverse(mCamera, mView);
        m4.multiply(mProjection, mView, mEye);
        gl.uniformMatrix4fv(shader.uniforms.u_eye, false, mEye);
    }

    function setDirectionalLight(lightDirection, shader) {
        gl.uniform3fv(shader.uniforms.u_light, lightDirection);
    }

    function drawModelElements(model) {
        gl.drawElements(gl.TRIANGLES, model.nVertices, gl.UNSIGNED_SHORT, 0);
    }

    function setModelColor(color) {
        gl.uniform4fv(modelShader.uniforms.u_color, new Float32Array(color));
    }

    function setModelTransformsT(position) {
        m4.translate(mModel, position, mModel);
    }

    function setModelTransformsTSR(position, scale, rotation) {
        m4.translate(mModel, position, mModel);
        m4.rotateZ(mModel, rotation[2], mModel);
        m4.rotateY(mModel, rotation[1], mModel);
        m4.rotateX(mModel, rotation[0], mModel);
        m4.scale(mModel, scale, mModel);
    }

    function setTransformUniforms() {
        m4.inverse(mModel, mNormal);
        m4.transpose(mNormal, mNormal);

        gl.uniformMatrix4fv(modelShader.uniforms.u_model, false, mModel);
        gl.uniformMatrix4fv(modelShader.uniforms.u_normal, false, mNormal);
    }

    function loadModels() {
        models.cube = loadModel(gl, res.objs.cube);
        models.octahedron = loadModel(gl, res.objs.octahedron);
    }

    function generateStaticModel(cubes) {
        var cubeObj = parseOBJ(res.objs.cube);

        var positions = [];
        var normals = [];
        var colors = [];
        var indices = [];

        var nVertices = cubeObj.positions.length / 3;

        cubes.forEach(function(cube, i) {
            positions = positions.concat(cubeObj.positions.map(function(pos, iPos) {
                if (iPos % 3 == 0) {
                    return pos + cube.position[0];
                } else if (iPos % 3 == 1) {
                    return pos + cube.position[1];
                } else {
                    return pos + cube.position[2];
                }
            }));
            normals = normals.concat(cubeObj.normals);
            for (var j = 0; j < cubeObj.positions.length / 3; j++)
                colors.push(cube.color[0], cube.color[1], cube.color[2]);
            indices = indices.concat(cubeObj.indices.map(function(index) {
                return index + (i * nVertices);
            }));
        });

        console.log(positions);
        console.log(normals);
        console.log(colors);
        console.log(indices);

        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        var buffers = {
            position: glh.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(positions)),
            normal: glh.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)),
            colors: glh.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors)),
            indices: glh.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)),
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(staticShader.attributes.a_position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(staticShader.attributes.a_normal, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
        gl.vertexAttribPointer(staticShader.attributes.a_color, 3, gl.FLOAT, false, 0, 0);

        glh.enableVertexAttributeArrays(gl, staticShader.attributes);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.bindVertexArray(null);

        return {
            vao: vao,
            nVertices: indices.length
        };
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
        gl.vertexAttribPointer(modelShader.attributes.a_position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(modelShader.attributes.a_normal, 3, gl.FLOAT, false, 0, 0);

        glh.enableVertexAttributeArrays(gl, modelShader.attributes);

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