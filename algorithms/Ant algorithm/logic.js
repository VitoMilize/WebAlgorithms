import {drawRect, drawField, initProgramField, initProgramRect} from './WebGLFunctions.js';


const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");
let programField = gl.createProgram();
let programRect = gl.createProgram();

let fieldSize = 100;
let tileSize = 2/fieldSize;
initProgramRect(gl, programRect, canvas.width, canvas.height, tileSize);
initProgramField(gl, programField, canvas.width, canvas.height);

let field = new Array(fieldSize);
for (let i = 0; i < fieldSize; i++) {
    field[i] = new Array(fieldSize);  
    for (let j = 0; j < fieldSize; j++) {
        field[i][j] = Math.random();        
    }  
}

let a = 1;
function update()
{
    let t0 = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT);
    // for (let i = 0; i < fieldSize; i++) {
    //     for (let j = 0; j < fieldSize; j++) {
    //         draw(gl, program, [i*tileSize, j*tileSize], [a,0,0,1]);
    //     }
    // }
    drawField(gl, programField)
    drawRect(gl, programRect, [0.1, 0.1], [1,0,1,1]);

    let t1 = performance.now();
    console.log(t1-t0);
    a+=0.01;
    //requestAnimationFrame(update);
}
update();