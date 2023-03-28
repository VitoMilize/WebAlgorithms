import {draw, initWebGL} from './WebGLFunctions.js';


const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");
let program = gl.createProgram();

let fieldSize = 100;
let tileSize = 2/fieldSize;
initWebGL(gl, program, canvas.width, canvas.height, tileSize);


let a = 0;
function update()
{
    let t0 = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < fieldSize; i++) {
        for (let j = 0; j < fieldSize; j++) {
         draw(gl, program, [i*tileSize, j*tileSize], [a,0,0,1]);
        }
    }
    let t1 = performance.now();
    console.log(t1-t0);
    a+=0.01;
    requestAnimationFrame(update);
}
update();