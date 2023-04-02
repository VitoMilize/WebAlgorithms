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

const inputBrushSize = document.getElementById('inputBrushSize');
inputBrushSize.addEventListener('focusout', function()
{
    brushSize = parseInt(inputBrushSize.value);
})

const selectBrush = document.getElementById('selectBrush');
selectBrush.addEventListener('change', function()
{
    brush = selectBrush.value;
});

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

let brushTypes = {home:'home', food:"food", obstacle:'obstacle', homeMarker:'homeMarker', foodMarker:'foodMarker'};
let brush = selectBrush.value; 
let brushSize = parseInt(inputBrushSize.value);

let objId = {home: 1, food: 2, obstacle: 3};

let fieldColors = {
    home : [255, 0, 0, 255],
    food : [0, 0, 255, 255],
    obstacle : [100, 100, 100, 255],
}

let antsColors = {
    antTargetFood : [255, 100, 100, 255],
    antTargetHome : [100, 100, 255, 255],
}

for (const key in fieldColors) {
    fieldColors[key][0] /= 255;
    fieldColors[key][1] /= 255;
    fieldColors[key][2] /= 255;
    fieldColors[key][3] /= 255;
}
for (const key in antsColors) {
    antsColors[key][0] /= 255;
    antsColors[key][1] /= 255;
    antsColors[key][2] /= 255;
    antsColors[key][3] /= 255;
}

function createField()
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
    initProgramField(gl, programField, width, height, fieldColors, objId);
    initProgramAnt(gl, programAnt, width, height);
}

function regenerate()
{
    createField();
    draw({x:100, y:100}, brushTypes.home, 20);
    draw({x:250, y:150}, brushTypes.food, 20);
    createAnts();
    drySpeed = inputDrySpeed.value;
}
regenerate();

function createAnts()
{
    antCount = parseInt(inputAntCount.value);
    ants = new Array(antCount);
    let positions = [];
    for (let i = 0; i < fieldSizeX; i++) {
        for (let j = 0; j < fieldSizeY; j++) {
            if(field[(j*fieldSizeX+i)*3+1] == objId.home)
            {
                positions.push({x:i, y:j});
            }
        }
    }
    for (let i = 0; i < antCount; i++) {
        ants[i] = new Ant({x:100, y:100});
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

function fieldMauseDown(event)
{
    let pos = getFieldXY(event);
    isDraw = true;
    if(isDraw)
    {
        draw(pos, brush, brushSize)
    }
}

function getLenght(pos1, pos2)
{
    return Math.sqrt(Math.pow(Math.abs(pos1.x - pos2.x), 2) + Math.pow(Math.abs(pos1.y - pos2.y), 2));
}

function draw(pos, brush, size)
{
    for (let i = pos.x - size; i <= pos.x+size; i++) {
        for (let j = pos.y - size; j <= pos.y + size; j++) {
            if (getLenght(pos, {x:i, y:j}) < size) 
            {
                switch (brush) {
                    case brushTypes.home:
                        field[(j*fieldSizeX+i)*3+1] = objId.home;
                        break;
                    case brushTypes.food:
                        field[(j*fieldSizeX+i)*3+1] = objId.food;
                        break;
                    case brushTypes.obstacle:
                        field[(j*fieldSizeX+i)*3+1] = objId.obstacle;
                        break;
                    case brushTypes.homeMarker:
                        field[(j*fieldSizeX+i)*3] = 255;
                        break;
                    case brushTypes.foodMarker:
                        field[(j*fieldSizeX+i)*3+2] = 255;
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

function fieldMouseMove(event)
{   
    let pos = getFieldXY(event);
    if(isDraw)
    {
        draw(pos, brush, brushSize)
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

        el = field[i*3+2];
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
        field[i*3+2] = el;
    }
}

function updateGame()
{
    dryField();
    for (let i = 0; i < antCount; i++) {
        ants[i].doStep(field, fieldSizeX, fieldSizeY, objId);
    }
}

let t0;
function update()
{
    t0 = performance.now();
    updateGame();
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawField(gl, programField, field, fieldSizeX, fieldSizeY);
    for (let i = 0; i < antCount; i++) {
        drawAnt(gl, programAnt, ratio, tileSize, ants[i], antsColors);
    }
    let t1 = performance.now();
    //console.log(t1-t0);
    requestAnimationFrame(update);
}
update();