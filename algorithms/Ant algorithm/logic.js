import {drawAnt, drawField, initProgramField, initProgramAnt} from './WebGLFunctions.js';
import { Ant } from './Ant.js';
const canvas = document.querySelector(".canvas");
canvas.addEventListener('mousedown', fieldMauseDown);
canvas.addEventListener('mousemove', fieldMouseMove);
canvas.addEventListener('mouseup', function(){isDraw = false;});

const regenButton = document.getElementById("regenButton");
regenButton.addEventListener('click', regenerate);

const inputFieldSize = document.getElementById('inputFieldSize');
const inputAntCount = document.getElementById('inputAntCount');
const inputDrySpeed = document.getElementById('inputDrySpeed');
inputDrySpeed.addEventListener('focusout', function(e)
{
    drySpeed = inputDrySpeed.value;
})

const inputAntSpeed = document.getElementById('inputAntSpeed');
inputAntSpeed.addEventListener('focusout', function(e)
{
    for (let i = 0; i < antCount; i++) {
        ants[i].speed = inputAntSpeed.value;
    }
})

let height = canvas.getBoundingClientRect().height;
let width = canvas.getBoundingClientRect().width;
let ratio = height/width;

const gl = canvas.getContext("webgl2");
let programField = gl.createProgram();
let programAnt = gl.createProgram();

let field;
let fieldSizeX, fieldSizeY;
let tileSize, tileSizePixels;

let antCount;
let ants;
let drySpeed;
let isDraw = false;

function cereateField()
{
    fieldSizeX = parseInt(inputFieldSize.value);
    fieldSizeY = parseInt(inputFieldSize.value * ratio);
    tileSizePixels = width/fieldSizeX;
    height = tileSizePixels * fieldSizeY;
    canvas.height = height;
    canvas.width = width;
    tileSize = 2/fieldSizeX;
    field = new Array(fieldSizeX * fieldSizeY * 3);
    for(let i = 0; i < fieldSizeX * fieldSizeY * 3; i++) field[i] = Math.random()*255*Math.random()*0;
    initProgramField(gl, programField, width, height);
    initProgramAnt(gl, programAnt, width, height);
}

function regenerate()
{
    //createAnts();
    cereateField();
    drySpeed = inputDrySpeed.value;
}
regenerate();

function createAnts()
{
    antCount = inputAntCount.value;
    ants = new Array(antCount);
    for (let i = 0; i < antCount; i++) {
        ants[i] = new Ant();
    }
}

function getFieldXY(event)
{
    let x = event.clientX - event.target.getBoundingClientRect().left;
    let y = height - (event.clientY - event.target.getBoundingClientRect().top);
    x = parseInt(x/tileSizePixels);
    y = parseInt(y/tileSizePixels);
    return {x:x, y:y};
}

function setAnthill(pos)
{
    field[(pos.y*fieldSizeX+pos.x)*3]=255;
    field[(pos.y*fieldSizeX+pos.x)*3 + 1]=128;
    // for (let i = 0; i < antCount; i++) {
    //    ants[i].pos = {x:x, y:y};
    //    ants[i].randDir();
    // }
}

function fieldMauseDown(event)
{
    let pos = getFieldXY(event);
    isDraw = true;
    //setAnthill(pos);
}

function getLenght(pos1, pos2)
{
    return Math.sqrt(Math.pow(Math.abs(pos1.x - pos2.x), 2) + Math.pow(Math.abs(pos1.y - pos2.y), 2));
}

let radius = 5;
function fieldMouseMove(event)
{
    let pos = getFieldXY(event);
    if(isDraw)
    {
        for (let i = pos.x - radius; i <= pos.x+radius; i++) {
            for (let j = pos.y - radius; j <= pos.y + radius; j++) {
                if (getLenght(pos, {x:i, y:j}) < radius) 
                {
                    field[(j*fieldSizeX+i)*3] = 255;
                }
            }
        }
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

function updateGame()
{
    dryField();
    for (let i = 0; i < antCount; i++) {
        ants[i].doStep(field, fieldSizeX, fieldSizeY);
    }
}

let t0;
function update()
{
    t0 = performance.now();
    //updateGame();
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawField(gl, programField, field, fieldSizeX, fieldSizeY);
    for (let i = 0; i < antCount; i++) {
        //drawAnt(gl, programAnt, ratio, tileSize, ants[i]);
    }
    let t1 = performance.now();
    //console.log(t1-t0);
    requestAnimationFrame(update);
}
update();