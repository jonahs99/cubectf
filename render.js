var renderer = {
    canvas: null,
    gl: null,
    shaderProgram: null,
    vertexBuffer: null,
    normalBuffer: null,
    drawOrderBuffer: null,
    colorBuffer: null,
    perspectiveMatrix: mat4.create(),
    lightMatrix: mat4.create()
};

function createBuffers() {
    var vertices = [
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5
    ];
    renderer.vertexBuffer = renderer.gl.createBuffer();
    renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, renderer.vertexBuffer);
    renderer.gl.bufferData(renderer.gl.ARRAY_BUFFER, new Float32Array(vertices), renderer.gl.STATIC_DRAW);

    var normals = [
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1
    ];
    renderer.normalBuffer = renderer.gl.createBuffer();
    renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, renderer.normalBuffer);
    renderer.gl.bufferData(renderer.gl.ARRAY_BUFFER, new Float32Array(normals), renderer.gl.STATIC_DRAW);

    var drawOrder = [
        0, 2, 1,
        1, 3, 2,
        4, 5, 6,
        5, 6, 7,
        8, 10, 9,
        9, 10, 11,
        12, 14, 13,
        13, 14, 15,
        16, 18, 17,
        17, 18, 19,
        20, 22, 21,
        21, 22, 23
    ];
    renderer.drawOrderBuffer = renderer.gl.createBuffer();
    renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, renderer.drawOrderBuffer);
    renderer.gl.bufferData(renderer.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(drawOrder), renderer.gl.STATIC_DRAW);

    var colors = [
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0
    ];
    renderer.colorBuffer = renderer.gl.createBuffer();
    renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, renderer.colorBuffer);
    renderer.gl.bufferData(renderer.gl.ARRAY_BUFFER, new Float32Array(colors), renderer.gl.STATIC_DRAW);

}

function bindBuffers() {
    renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, renderer.vertexBuffer);
    renderer.gl.vertexAttribPointer(renderer.shaderProgram.vertexPositionAttribute, 3, renderer.gl.FLOAT, false, 0, 0);

    renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, renderer.normalBuffer);
    renderer.gl.vertexAttribPointer(renderer.shaderProgram.vertexNormalAttribute, 3, renderer.gl.FLOAT, false, 0, 0);

    renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, renderer.colorBuffer);
    renderer.gl.vertexAttribPointer(renderer.shaderProgram.vertexColorAttribute, 3, renderer.gl.FLOAT, false, 0, 0);

    renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, renderer.drawOrderBuffer);
}

function draw(camera, cubes, players) {
    renderer.gl.viewport(0, 0, renderer.gl.viewportWidth, renderer.gl.viewportHeight);
    renderer.gl.clear(renderer.gl.COLOR_BUFFER_BIT | renderer.gl.DEPTH_BUFFER_BIT);

    // Create and pass the matrices to opengl

    var vMatrix = mat4.create();
    mat4.identity(vMatrix);
    mat4.rotateX(vMatrix, camera.pitch);
    mat4.rotateY(vMatrix, camera.yaw);
    mat4.translate(vMatrix, [camera.x, camera.y, camera.z]);

    setVPMatrixUniforms(vMatrix, renderer.perspectiveMatrix);

    for (var i = 0; i < cubes.length; i++) {
        var cube = cubes[i];
        setTintUniform(cube.color[0], cube.color[1], cube.color[2]);
        var mMatrix = mat4.create();
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [cubes[i].pos.x, cubes[i].pos.y, cubes[i].pos.z]);
        setMMatrixUniforms(mMatrix);
        setNormalMatrixUniform(mMatrix, vMatrix);
        renderer.gl.drawElements(renderer.gl.TRIANGLES, 36, renderer.gl.UNSIGNED_SHORT, 0);
    }

    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        var position = player.position;
        
        setTintUniform(0.9, 0, 0.3);

        // heads
        var mMatrix = mat4.create();
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [position.x, position.y + 1.5, position.z]);
        mat4.rotateY(mMatrix, player.yaw)
        mat4.rotateZ(mMatrix, player.pitch)
        mat4.scale(mMatrix, [0.55, 0.55, 0.55]);
        setMMatrixUniforms(mMatrix);
        setNormalMatrixUniform(mMatrix, vMatrix);
        renderer.gl.drawElements(renderer.gl.TRIANGLES, 36, renderer.gl.UNSIGNED_SHORT, 0);

        setTintUniform(0.1, 0.4, 1);

        //torso
        mMatrix = mat4.create();
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [position.x, position.y + .7, position.z]);
        mat4.rotateY(mMatrix, player.yaw)
        mat4.scale(mMatrix, [0.65, 0.75, 0.75]);
        setMMatrixUniforms(mMatrix);
        setNormalMatrixUniform(mMatrix, vMatrix);
        renderer.gl.drawElements(renderer.gl.TRIANGLES, 36, renderer.gl.UNSIGNED_SHORT, 0);

        //leg
        mMatrix = mat4.create();
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [position.x, position.y + .2, position.z]);
        mat4.rotateY(mMatrix, player.yaw)
        mat4.scale(mMatrix, [0.5, 0.4, 0.6]);
        setMMatrixUniforms(mMatrix);
        setNormalMatrixUniform(mMatrix, vMatrix);
        renderer.gl.drawElements(renderer.gl.TRIANGLES, 36, renderer.gl.UNSIGNED_SHORT, 0);
    }

}

function setVPMatrixUniforms(vMatrix, pMatrix) {
    renderer.gl.uniformMatrix4fv(renderer.shaderProgram.pMatrixUniform, false, pMatrix);
    renderer.gl.uniformMatrix4fv(renderer.shaderProgram.vMatrixUniform, false, vMatrix);
}

function setMMatrixUniforms(mMatrix) {
    renderer.gl.uniformMatrix4fv(renderer.shaderProgram.mMatrixUniform, false, mMatrix);
}

function setNormalMatrixUniform(mMatrix, vMatrix, pMatrix) {
    nMatrix = mat4.create();
    mat4.identity(nMatrix);
    mat4.multiply(nMatrix, mMatrix, nMatrix);
    mat4.inverse(nMatrix);
    mat4.transpose(nMatrix);
    renderer.gl.uniformMatrix4fv(renderer.shaderProgram.normalUniform, false, nMatrix);
}

function setTintUniform(r, g, b) {
    renderer.gl.uniform4fv(renderer.shaderProgram.tintUniform, [r, g, b, 1]);
}

function webGLStart() {
    renderer.canvas = document.getElementById('game-surface');

    initGL(renderer.canvas);
    initShaders();
    createBuffers();
    bindBuffers();

    renderer.gl.clearColor(0.15, 0.15, 0.15, 1.0);
    renderer.gl.enable(renderer.gl.DEPTH_TEST);
}

function initGL(canvas) {
    try {
        renderer.gl = canvas.getContext("experimental-webgl");
        resizeCanvas();
    } catch (e) {
    }
    if (!renderer.gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function initShaders() {
    var fragmentShader = getShader(renderer.gl, "shader-fs");
    var vertexShader = getShader(renderer.gl, "shader-vs");

    renderer.shaderProgram = renderer.gl.createProgram();
    renderer.gl.attachShader(renderer.shaderProgram, vertexShader);
    renderer.gl.attachShader(renderer.shaderProgram, fragmentShader);
    renderer.gl.linkProgram(renderer.shaderProgram);

    if (!renderer.gl.getProgramParameter(renderer.shaderProgram, renderer.gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    renderer.gl.useProgram(renderer.shaderProgram);

    renderer.shaderProgram.vertexPositionAttribute = renderer.gl.getAttribLocation(renderer.shaderProgram, "aVertexPosition");
    renderer.gl.enableVertexAttribArray(renderer.shaderProgram.vertexPositionAttribute);

    renderer.shaderProgram.vertexNormalAttribute = renderer.gl.getAttribLocation(renderer.shaderProgram, "aVertexNormal");
    renderer.gl.enableVertexAttribArray(renderer.shaderProgram.vertexNormalAttribute);

    renderer.shaderProgram.vertexColorAttribute = renderer.gl.getAttribLocation(renderer.shaderProgram, "aVertexColor");
    renderer.gl.enableVertexAttribArray(renderer.shaderProgram.vertexColorAttribute);

    renderer.shaderProgram.pMatrixUniform = renderer.gl.getUniformLocation(renderer.shaderProgram, "uPMatrix");
    renderer.shaderProgram.vMatrixUniform = renderer.gl.getUniformLocation(renderer.shaderProgram, "uVMatrix");
    renderer.shaderProgram.mMatrixUniform = renderer.gl.getUniformLocation(renderer.shaderProgram, "uMMatrix");
    renderer.shaderProgram.normalUniform = renderer.gl.getUniformLocation(renderer.shaderProgram, "uNormalMatrix");
    renderer.shaderProgram.tintUniform = renderer.gl.getUniformLocation(renderer.shaderProgram, "uTint");
}

function resizeCanvas() {
    renderer.canvas.width = window.innerWidth;
    renderer.canvas.height = window.innerHeight;
    renderer.gl.viewportWidth = renderer.canvas.width;
    renderer.gl.viewportHeight = renderer.canvas.height;
    mat4.perspective(45, renderer.gl.viewportWidth / renderer.gl.viewportHeight, 0.1, 100.0, renderer.perspectiveMatrix);
}

window.onresize = resizeCanvas;
