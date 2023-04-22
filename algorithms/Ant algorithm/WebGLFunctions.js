
export function drawField(gl, program, field, sizeX, sizeY)
{
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

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, sizeX, sizeY, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array(field));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    let textureLocation = gl.getUniformLocation(program, "uTexture");
    gl.uniform1i(textureLocation, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export function initProgramField(gl, program, width, height, colors, ids)
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
      const int len = ${Object.keys(colors).length};
      uniform float width;
      uniform float height;
      uniform vec4 colors[len];
      uniform float ids[len];
      uniform sampler2D uTexture;
      void main() {
        float x = gl_FragCoord.x/width;
        float y = gl_FragCoord.y/height;
	      vec4 c = texture2D(uTexture, vec2(x, y));
        bool idColor = false;
        for(int i = 0; i < len; i++)
        {
          if(abs(c.g - ids[i]/255.0) < 0.0001)
          {
            c = colors[i];
            idColor = true;
          }
        }
        if(idColor)
        {
          gl_FragColor = c;
        }
        else
        {
          gl_FragColor = vec4(c.r, 0, c.b, 1.0);
        } 
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

    let widthLoc = gl.getUniformLocation(program, "width");
    let heigthLoc = gl.getUniformLocation(program, "height");
    
    let colorsLoc = gl.getUniformLocation(program, "colors");
    let idsLoc = gl.getUniformLocation(program, "ids");

    gl.uniform1f(widthLoc, width);
    gl.uniform1f(heigthLoc, height);

    gl.uniform4fv(colorsLoc, Object.values(colors).flat());
    gl.uniform1fv(idsLoc, Object.values(ids));
}

export function drawAnt(gl, program, ratio, size, ant, colors)
{
  gl.useProgram(program);
  
  let s = size*2;
  let positions = new Float32Array([
    -0.5*s, 1.5*s, //left up
    0.5*s, 1.5*s, //right up
    -1*s, 0, //left down
    1*s, 0, //rigth down
    -0.5*s, -1.5*s,
    0.5*s, -1.5*s,
  ]);

  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  let modelMatrixLocation = gl.getUniformLocation(program, "uModelMatrix");
  let colorUniformLocation = gl.getUniformLocation(program, "u_color");

  let deltaX = 1 + size*ratio , deltaY = 1;

  let scaleMatrix = mat4.create();
  let rotationMatrix = mat4.create();
  let translationMatrix = mat4.create();
  let modelMatrix = mat4.create();
  mat4.fromScaling(scaleMatrix, [0.5,1,1]);
  mat4.fromRotation(rotationMatrix, ant.dir - Math.PI/2, [0, 0, 1]);
  mat4.fromTranslation(translationMatrix, [-deltaX + size*(ant.pos.x+1), -deltaY + (size/ratio)*(ant.pos.y+1), 0]);
  mat4.mul(modelMatrix, scaleMatrix, rotationMatrix);
  mat4.mul(modelMatrix, translationMatrix, modelMatrix);
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

  if (ant.target == 'food') {
    gl.uniform4fv(colorUniformLocation, colors.antTargetFood);
  }
  else 
  {
    gl.uniform4fv(colorUniformLocation, colors.antTargetHome);
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length); 
}

export function initProgramAnt(gl, program, width, height)
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
}
