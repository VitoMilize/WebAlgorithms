import {drawAnt, drawField, initProgramField, initProgramAnt} from './WebGLFunctions.js';
import { Ant } from './Ant.js';
const canvas = document.querySelector(".canvas");
canvas.addEventListener('mousedown', setAnthill);

let height = canvas.getBoundingClientRect().height;
let width = canvas.getBoundingClientRect().width;
let ratio = height/width;

const gl = canvas.getContext("webgl2");
let programField = gl.createProgram();
let programAnt = gl.createProgram();

let inputSize = 900;
let field;
let fieldSizeX, fieldSizeY;
let tileSize, tileSizePixels;

let antCount = 50;
let ants = new Array(antCount);
for (let i = 0; i < antCount; i++) {
    ants[i] = new Ant();
}

let drySpeed = 1;

function createField()
{
    fieldSizeX = parseInt(inputSize);
    fieldSizeY = parseInt(inputSize * ratio);
    tileSizePixels = width/fieldSizeX;
    height = tileSizePixels * fieldSizeY;
    canvas.height = height;
    console.log(fieldSizeX, fieldSizeY);
    tileSize = 2/fieldSizeX;
    
    field = new Array(fieldSizeX * fieldSizeY * 3);
    for(let i = 0; i < fieldSizeX * fieldSizeY * 3; i++) field[i] = Math.random()*255*0;
    initProgramField(gl, programField, width, height);
    initProgramAnt(gl, programAnt, width, height);

}
createField();

function setAnthill(event)
{
    let t = event.target;
    let x = event.clientX - t.offsetLeft;
    let y = height - (event.clientY - t.offsetTop);
    x = parseInt(x/tileSizePixels);
    y = parseInt(y/tileSizePixels);
    field[(y*fieldSizeX+x)*3]=1;
    field[(y*fieldSizeX+x)*3 + 1]=128;
    for (let i = 0; i < antCount; i++) {
       ants[i].pos = {x:x, y:y};
       ants[i].randDir();
    }
}

function dryField()
{
    for(let i = 0; i < fieldSizeX * fieldSizeY; i++)
    {
        let el = field[i*3];
        if(el > 0)
        {
            if(el - drySpeed >= 0)
            {
                el -= drySpeed;
            }
            else
            {
                el = 0;
            }
        }
        field[i*3] = el;
    }
}


let t0;
function update()
{
    t0 = performance.now();

    dryField();

    for (let i = 0; i < antCount; i++) {
        ants[i].doStep(field, fieldSizeX, fieldSizeY);
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawField(gl, programField, field, fieldSizeX, fieldSizeY);
    for (let i = 0; i < antCount; i++) {
        drawAnt(gl, programAnt, ratio, tileSize, ants[i]);
    }
    let t1 = performance.now();
    //console.log(t1-t0);
    requestAnimationFrame(update);
}
update();