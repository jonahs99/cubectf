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