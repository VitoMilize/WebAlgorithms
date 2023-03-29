let rectBuffer;

export function drawRect(gl, program, pos, color)
{
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, rectBuffer);

  let modelMatrixLocation = gl.getUniformLocation(program, "uModelMatrix");
  let colorUniformLocation = gl.getUniformLocation(program, "u_color");
  let modelMatrix = mat4.create();
  mat4.fromTranslation(modelMatrix, [pos[0], pos[1], 0]);
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
  gl.uniform4fv(colorUniformLocation, color);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
}

export function drawField(gl, program)
{
    gl.useProgram(program);
    let arr = new Array(100*100*3);

    for (let i = 0; i < 100*100*3; i++) {
        if (i % 3 == 0) {
          arr[i] = 255;
        }
        else
        {
          arr[i] = 0;
        }
    }

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 100, 100, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array(arr));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    let textureLocation = gl.getUniformLocation(program, "uTexture");
    gl.uniform1i(textureLocation, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
}

export function initProgramField(gl, program, width, height)
{
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    
    let fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D uTexture;
      void main() {
        vec2 st = gl_FragCoord.xy/100.0;
	      gl_FragColor = texture2D(uTexture, st);
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
      -1, 1, //left up
      1, 1, //right up
      -1, -1, //left down
      1, -1, //rigth down
    ]);
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
}

export function initProgramRect(gl, program, width, height, tileSize)
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
    rectBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
}