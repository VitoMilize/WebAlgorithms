import { drawAnt, drawField, initProgramField, initProgramAnt } from './WebGLFunctions.js';
import { Ant } from './Ant.js';
const canvas = document.querySelector(".canvas");
canvas.addEventListener('mousedown', fieldMauseDown);
canvas.addEventListener('mousemove', fieldMouseMove);
canvas.addEventListener('mouseup', function () { isDraw = false; });

const regenButton = document.getElementById("regenButton");
regenButton.addEventListener('click', regenerate);

const startButton = document.getElementById("startButton");
startButton.addEventListener('click', function () {
    if (simulationSpeed != 0) {
        previusSumilationSpeed = simulationSpeed;
        simulationSpeed = 0;
    }
    else {
        simulationSpeed = previusSumilationSpeed;
    }
    if (firstTimeAfterGeneration) {
        regenerate();
        simulationSpeed = parseInt(inputSimulationSpeed.value);
    }

});

const inputFieldSize = document.getElementById('inputFieldSize');
const inputAntCount = document.getElementById('inputAntCount');

const inputSimulationSpeed = document.getElementById('inputSimulationSpeed');
inputSimulationSpeed.addEventListener('focusout', function (e) {
    simulationSpeed = parseInt(inputSimulationSpeed.value);
    for (let i = 0; i < antCount; i++) {
        ants[i].speed = simulationSpeed;
    }
    drySpeed = Math.pow(0.998, simulationSpeed);
})

const inputBrushSize = document.getElementById('inputBrushSize');
inputBrushSize.addEventListener('focusout', function () {
    brushSize = parseInt(inputBrushSize.value);
})

const selectBrush = document.getElementById('selectBrush');
selectBrush.addEventListener('change', function () {
    brush = selectBrush.value;
});

let height = canvas.getBoundingClientRect().height;
let width = canvas.getBoundingClientRect().width;
let ratio = height / width;

const gl = canvas.getContext("webgl2");
let programField = gl.createProgram();
let programAnt = gl.createProgram();

let field;
let fieldSizeX, fieldSizeY;
let tileSize, tileSizePixels;

let simulationSpeed = 0;
let firstTimeAfterGeneration = true;
let previusSumilationSpeed = simulationSpeed;
let drySpeed = 1;

let antCount;
let ants;
let isDraw = false;

let brushTypes = { home: 'home', food: "food", obstacle: 'obstacle', homeMarker: 'homeMarker', foodMarker: 'foodMarker' };
let brush = selectBrush.value;
let brushSize = parseInt(inputBrushSize.value);

let objId = { home: 1, food: 2, obstacle: 3 };
let antTarget = { home: 'home', food: 'food' };


let fieldColors = {
    home: [255, 0, 0, 255],
    food: [0, 0, 255, 255],
    obstacle: [100, 100, 100, 255],
}

let antsColors = {
    antTargetFood: [255, 100, 100, 255],
    antTargetHome: [100, 100, 255, 255],
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

function createField() {
    fieldSizeX = parseInt(inputFieldSize.value);
    fieldSizeY = parseInt(inputFieldSize.value * ratio);
    tileSizePixels = width / fieldSizeX;
    height = tileSizePixels * fieldSizeY;
    canvas.height = height;
    canvas.width = width;
    tileSize = 2 / fieldSizeX;
    field = new Array(fieldSizeX * fieldSizeY * 3);
    for (let i = 0; i < fieldSizeX * fieldSizeY * 3; i++) field[i] = Math.random() * 255 * Math.random() * 0;
    initProgramField(gl, programField, width, height, fieldColors, objId);
    initProgramAnt(gl, programAnt, width, height);
}

function regenerate() {
    firstTimeAfterGeneration = false;
    createField();
    draw({ x: 100, y: 100 }, brushTypes.home, 20);
    draw({ x: 450, y: 200 }, brushTypes.food, 20);
    createAnts();
}

function createAnts() {
    antCount = parseInt(inputAntCount.value);
    ants = new Array(antCount);
    let positions = [];
    for (let i = 0; i < fieldSizeX; i++) {
        for (let j = 0; j < fieldSizeY; j++) {
            if (field[(j * fieldSizeX + i) * 3 + 1] == objId.home) {
                positions.push({ x: i, y: j });
            }
        }
    }
    for (let i = 0; i < antCount; i++) {
        ants[i] = new Ant({ x: 100, y: 100 });
    }
}

function getFieldXY(event) {
    let x = event.clientX - event.target.getBoundingClientRect().left;
    let y = height - (event.clientY - event.target.getBoundingClientRect().top);
    x = parseInt(x / tileSizePixels);
    y = parseInt(y / tileSizePixels);
    return { x: x, y: y };
}

function fieldMauseDown(event) {
    let pos = getFieldXY(event);
    isDraw = true;
    if (isDraw) {
        draw(pos, brush, brushSize)
    }
}

function getLenght(pos1, pos2) {
    return Math.sqrt(Math.pow(Math.abs(pos1.x - pos2.x), 2) + Math.pow(Math.abs(pos1.y - pos2.y), 2));
}

function draw(pos, brush, size) {
    for (let i = pos.x - size; i <= pos.x + size; i++) {
        for (let j = pos.y - size; j <= pos.y + size; j++) {
            if (getLenght(pos, { x: i, y: j }) < size) {
                switch (brush) {
                    case brushTypes.home:
                        field[(j * fieldSizeX + i) * 3 + 1] = objId.home;
                        field[(j * fieldSizeX + i) * 3] = 255;
                        break;
                    case brushTypes.food:
                        field[(j * fieldSizeX + i) * 3 + 1] = objId.food;
                        field[(j * fieldSizeX + i) * 3 + 2] = 255;
                        break;
                    case brushTypes.obstacle:
                        field[(j * fieldSizeX + i) * 3 + 1] = objId.obstacle;
                        break;
                    case brushTypes.homeMarker:
                        field[(j * fieldSizeX + i) * 3] = 255;
                        break;
                    case brushTypes.foodMarker:
                        field[(j * fieldSizeX + i) * 3 + 2] = 255;
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

function fieldMouseMove(event) {
    let pos = getFieldXY(event);
    if (isDraw) {
        draw(pos, brush, brushSize)
    }
}

function dryField() {
    for (let i = 0; i < fieldSizeX * fieldSizeY; i++) {
        if (field[i * 3 + 1] != objId.home)
            field[i * 3] *= drySpeed;
        if (field[i * 3 + 1] != objId.food)
            field[i * 3 + 2] *= drySpeed;
    }
}

function updateGame() {

    dryField();
    for (let i = 0; i < antCount; i++) {
        updateAnt(ants[i], field, fieldSizeX, fieldSizeY, objId);

    }
}

function update() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!firstTimeAfterGeneration) {
        if (simulationSpeed > 0)
            updateGame();
        drawField(gl, programField, field, fieldSizeX, fieldSizeY);
        for (let i = 0; i < antCount; i++) {
            drawAnt(gl, programAnt, ratio, tileSize, ants[i], antsColors);
        }
    }
    console.log(simulationSpeed)
    requestAnimationFrame(update);
}
update();

function updateAnt(ant, field, fieldSizeX, fieldSizeY, objId) {
    let x = Math.ceil(ant.pos.x)
    let y = Math.ceil(ant.pos.y)


    if (field[(y * fieldSizeX + x) * 3 + 1] == objId.food && ant.target == antTarget.food) {
        ant.target = antTarget.home;
        ant.dir -= Math.PI;
        ant.clock = 0;
    }
    if (field[(y * fieldSizeX + x) * 3 + 1] == objId.home && ant.target == antTarget.home) {
        ant.target = antTarget.food;
        ant.dir -= Math.PI;
        ant.clock = 0;
    }

    if (ant.target == antTarget.food) {
        field[(y * fieldSizeX + x) * 3] = Math.max(field[(y * fieldSizeX + x) * 3], ant.markerIntensity * Math.exp(-0.005 * ant.clock));
        if (field[(y * fieldSizeX + x) * 3] > 255) field[(y * fieldSizeX + x) * 3] = 255;
    }
    else {
        field[(y * fieldSizeX + x) * 3 + 2] = Math.max(field[(y * fieldSizeX + x) * 3 + 2], ant.markerIntensity * Math.exp(-0.005 * ant.clock));
        if (field[(y * fieldSizeX + x) * 3 + 2] > 255) field[(y * fieldSizeX + x) * 3 + 2] = 255;
    }

    let maxProb = 0;
    let tile;
    for (let i = x - ant.sniffRange; i <= x + ant.sniffRange; i++) {
        for (let j = y - ant.sniffRange; j <= y + ant.sniffRange; j++) {
            if (i == x && j == y) continue;
            if (-1 <= i && i < fieldSizeX + 1 && -1 <= j && j < fieldSizeY + 1) {
                let marker1;
                if (ant.target == antTarget.food) {
                    marker1 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'b')
                }
                else {
                    marker1 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'r')
                }
                let prob = transitionProb1(x, y, ant.dir, i, j, marker1, getObstacle(i, j, field, fieldSizeX, fieldSizeY));
                if (prob > maxProb) {
                    maxProb = prob;
                    tile = { x: i, y: j };
                }
            }
        }
    }


    ant.dir = angleVectors(1, 0, tile.x - x, tile.y - y);
    ant.dir += (Math.random() - 0.5) * Math.PI / 8;

    let newPosX = ant.pos.x + Math.cos(ant.dir) * ant.speed;
    let newPosY = ant.pos.y + Math.sin(ant.dir) * ant.speed;


    if (0 <= newPosX && newPosX < fieldSizeX - 1) {
        ant.pos.x = newPosX;
    }
    else {
        if (Math.sin(ant.dir) < 0)
            ant.dir = Math.PI * 2 - Math.acos(-Math.cos(ant.dir));
        else
            ant.dir = Math.acos(-Math.cos(ant.dir));
    }

    if (0 <= newPosY && newPosY < fieldSizeY - 1) {
        ant.pos.y = newPosY;
    }
    else {
        ant.dir = -ant.dir;
    }

    ant.clock++;
}

function transitionProb1(antX, antY, dir, tileX, tileY, marker1, obstacle) {
    let dirVec = { x: Math.cos(dir), y: Math.sin(dir) };
    let tileVec = { x: tileX - antX, y: tileY - antY };
    let scalar = dirVec.x * tileVec.x + dirVec.y * tileVec.y;
    let modul = Math.sqrt(tileVec.x * tileVec.x + tileVec.y * tileVec.y);
    let angle = Math.acos(scalar / modul);
    return ((1 - angle / Math.PI) + marker1 / 255 * Math.random() * 2) * obstacle;
}

function angleVectors(x1, y1, x2, y2) {
    let scalar = x1 * x2 + y1 * y2;
    let modul1 = Math.sqrt(x1 * x1 + y1 * y1);
    let modul2 = Math.sqrt(x2 * x2 + y2 * y2);
    let angle = Math.acos(scalar / (modul1 * modul2));
    if (y2 < 0) angle = -angle;
    return angle;
}

function getMarker(x, y, field, fieldSizeX, fieldSizeY, color) {
    if (x < 0 || x >= fieldSizeX || y < 0 || y >= fieldSizeY) return 0;
    if (color == 'r') return field[(y * fieldSizeX + x) * 3];
    else return field[(y * fieldSizeX + x) * 3 + 2];
}

function getObstacle(x, y, field, fieldSizeX, fieldSizeY) {
    if (x < 0 || x >= fieldSizeX || y < 0 || y >= fieldSizeY) return 0.0001;
    if (field[(y * fieldSizeX + x) * 3 + 1] == objId.obstacle) return 0.0001;
    else return 1;
}