const fieldRoot = document.querySelector('.field');
fieldRoot.addEventListener('mousedown', function (event) { isDrawing = true; draw(event); });
fieldRoot.addEventListener('mousemove', function (event) { if (isDrawing) { draw(event); } });
fieldRoot.addEventListener('mouseup', function () { isDrawing = false; });
fieldRoot.addEventListener('mouseleave', function () { isDrawing = false; });
const lableAnswer = document.querySelector('.lableAnswer');

let tileSize = 10;
let innerFieldSize = 28;
let outerFieldSize = 28;

let innerField = new Array(innerFieldSize * innerFieldSize);
let outerField = new Array(outerFieldSize * outerFieldSize);
let fieldDivs = new Array(outerFieldSize * outerFieldSize);

let layers = [innerFieldSize * innerFieldSize, 512, 128, 10];
let weightMatrixes = new Array(layers.length);
let neuronOutputs = new Array(layers.length);

let brushSize = 2;
let isDrawing = false;

function addDivsToDisplay() {
    for (let i = 0; i < outerFieldSize; i++) {
        let row = document.createElement("div");
        row.style.display = "flex";
        for (let j = 0; j < outerFieldSize; j++) {
            let tile = document.createElement("div");
            tile.style.width = tileSize + 'px';
            tile.style.height = tileSize + 'px';
            tile.style.background = "rgb(128, 128, 128)";
            tile.style.userSelect = "none";
            fieldDivs[i * outerFieldSize + j] = tile;
            row.appendChild(tile);
            outerField[i * outerFieldSize + j] = 0;
        }
        fieldRoot.appendChild(row);
    }
    fieldRoot.style.width = outerFieldSize * tileSize + 'px';
    fieldRoot.style.height = outerFieldSize * tileSize + 'px';
}

function updateFiedlDivs() {
    for (let i = 0; i < outerFieldSize * outerFieldSize; i++) {
        let color = 255 - outerField[i];
        fieldDivs[i].style.background = `rgb(${color},${color},${color})`;
    }
}

function draw(event) {
    let x = event.clientX - fieldRoot.getBoundingClientRect().left;
    let y = event.clientY - fieldRoot.getBoundingClientRect().top;

    let tileX = parseInt(x / tileSize);
    let tileY = parseInt(y / tileSize);

    for (let i = tileX - brushSize; i <= tileX + brushSize; i++) {
        for (let j = tileY - brushSize; j <= tileY + brushSize; j++) {
            if (0 <= i && i < outerFieldSize && 0 <= i && j < outerFieldSize) {
                if (getLenght({ x: i, y: j }, { x: tileX, y: tileY }) < brushSize) {
                    //let l = getLenght({ x: i, y: j }, { x: tileX, y: tileY });
                    //outerField[j * outerFieldSize + i] += 255 * ((-0.1)*l*l*l + 1);
                    // if(outerField[j * outerFieldSize + i] > 255) 
                    // {
                    //     outerField[j * outerFieldSize + i] = 255;
                    // }
                    outerField[j * outerFieldSize + i] = 255;
                }
            }
        }
    }
    updateFiedlDivs();
    let ans = detectNumber();
    lableAnswer.textContent = "Answer: " + ans;
    //console.log(ans);
}

function createInputMatrix() {
    let matrix = [];
    for (let i = 0; i < outerField.length; i++) {
        matrix.push([outerField[i]]);
    }
    return matrix;
}

function detectNumber() {
    let inputMatrix = createInputMatrix()
    return neuronWork(inputMatrix);
}

function neuronWork(inputMatrix) {
    neuronOutputs[0] = inputMatrix;
    for (let i = 1; i < layers.length; i++) {
        neuronOutputs[i] = MultiplyMatrix(weightMatrixes[i], neuronOutputs[i - 1]);
        neuronOutputs[i] = applySigmoid(neuronOutputs[i]);
    }
    let answer = 0;
    let maxValue = 0;
    for (let i = 0; i < neuronOutputs[neuronOutputs.length - 1].length; i++) {
        if (neuronOutputs[neuronOutputs.length - 1][i][0] > maxValue) {
            maxValue = neuronOutputs[neuronOutputs.length - 1][i][0];
            answer = i;
        }
        console.log(i + ": " + neuronOutputs[neuronOutputs.length - 1][i][0])
    }
    return answer;
}

async function loadWeights() {
    let promises = [];
    for (let i = 1; i < layers.length; i++) {
        promises.push(
            fetch('weights/' + (i - 1) + '-' + i + '.json')
                .then(response => response.json())
                .then(data => {
                    weightMatrixes[i] = data;
                })
                .catch(error => {
                    console.error(error);
                })
        )
    }
    await Promise.all(promises);
}

loadWeights().then(() => {
    addDivsToDisplay();
    for (let i = 0; i < layers.length; i++) {
        neuronOutputs[i] = new Array(layers[i]);
        for (let j = 0; j < layers[i]; j++) {
            neuronOutputs[i][j] = 0;
        }
    }
})












function applySigmoid(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        matrix[i][0] = sigmoid(matrix[i][0]);
    }
    return matrix;
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function MultiplyMatrix(A, B) {
    var rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        C = [];
    if (colsA != rowsB) return false;
    for (var i = 0; i < rowsA; i++) C[i] = [];
    for (var k = 0; k < colsB; k++) {
        for (var i = 0; i < rowsA; i++) {
            var t = 0;
            for (var j = 0; j < rowsB; j++) t += A[i][j] * B[j][k];
            C[i][k] = t;
        }
    }
    return C;
}

function getLenght(pos1, pos2) {
    return Math.sqrt(Math.pow(Math.abs(pos1.x - pos2.x), 2) + Math.pow(Math.abs(pos1.y - pos2.y), 2));
}
