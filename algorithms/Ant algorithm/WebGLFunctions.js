export function draw(gl, program, pos, color)
{
    let modelMatrixLocation = gl.getUniformLocation(program, "uModelMatrix");
    let colorUniformLocation = gl.getUniformLocation(program, "u_color");
    let modelMatrix = mat4.create();
    mat4.fromTranslation(modelMatrix, [pos[0], pos[1], 0]);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.uniform4fv(colorUniformLocation, color);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
}

export function initWebGL(gl, program, width, height, tileSize)
{
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let vertexShaderSource = `
      attribute vec2 a_position;
      uniform mat4 uModelMatrix;
      void main() {
        gl_Position = uModelMatrix * vec4(a_position, 0.0, 1.0);
      }
    `;
    
    let fragmentShaderSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
        gl_FragColor = u_color;
      }
    `;
    
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    
    let positions = new Float32Array([
        -1, -1+tileSize, //left up
        -1+tileSize, -1+tileSize, //right up
        -1, -1, //left down
        -1+tileSize, -1, //rigth down
    ]);
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
}