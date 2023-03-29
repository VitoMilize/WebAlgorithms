import {drawRect, drawField, initProgramField, initProgramRect} from './WebGLFunctions.js';
const canvas = document.querySelector(".canvas");
canvas.addEventListener('mousedown', setAnthill);

let deltaHeight;
let height = canvas.getBoundingClientRect().height;
let width = canvas.getBoundingClientRect().width;
let ratio = height/width;

const gl = canvas.getContext("webgl2");
let programField = gl.createProgram();
let programRect = gl.createProgram();

let inputSize = 100;
let field;
let fieldSizeX, fieldSizeY;
let tileSize, tileSizePixels;
function createField()
{
    fieldSizeX = parseInt(inputSize);
    fieldSizeY = parseInt(inputSize * ratio);
    tileSizePixels = width/fieldSizeX;
    deltaHeight = height - tileSizePixels * fieldSizeY;
    height -= deltaHeight;
    console.log(fieldSizeX, fieldSizeY);
    tileSize = 2/fieldSizeX;
    
    field = new Array(fieldSizeX * fieldSizeY * 3);
    for(let i = 0; i < fieldSizeX * fieldSizeY * 3; i++) field[i] = Math.random()*255*0;
    initProgramField(gl, programField, width, height);
    initProgramRect(gl, programRect, width, height, tileSize);

}
createField();

function setAnthill(event)
{
    let t = event.target;
    let x = event.clientX - t.offsetLeft;
    let y = height - (event.clientY - t.offsetTop) + deltaHeight;
    x = parseInt(x/tileSizePixels);
    y = parseInt(y/tileSizePixels);
    console.log(x, y);
    field[(y*fieldSizeX+x)*3]=1;
    field[(y*fieldSizeX+x)*3 + 1]=128;
}

function update()
{
    let t0 = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    drawField(gl, programField, field, fieldSizeX, fieldSizeY);
    drawRect(gl, programRect, ratio, [0, 0], tileSize, [1,0,1,1]);

    let t1 = performance.now();
    //console.log(t1-t0);
 
    requestAnimationFrame(update);
}
update();