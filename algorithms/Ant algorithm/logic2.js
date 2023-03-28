const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
const positions = new Float32Array([
  -0.5, 0.5,
  0.5, 0.5,
  -0.5, -0.5,
  0.5, -0.5,
]);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const colorUniformLocation = gl.getUniformLocation(program, "u_color");
gl.uniform4f(colorUniformLocation, 1.0, 1.0, 1.0, 1.0);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

a = 0.0;

function update()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4f(colorUniformLocation, a, a, a, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    a += 0.01
    requestAnimationFrame(update);
}
update();