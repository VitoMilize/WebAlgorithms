const fieldCanvas = document.querySelector('.fieldCanvas');
fieldCanvas.addEventListener('mousedown', function (event) { isDrawing = true; draw(event); });
fieldCanvas.addEventListener('mousemove', function (event) { if (isDrawing) { draw(event); } });
fieldCanvas.addEventListener('mouseup', function () { isDrawing = false; });
fieldCanvas.addEventListener('mouseleave', function () { isDrawing = false; });
let ctx = fieldCanvas.getContext('2d');

const inputBrushSize = document.getElementById('inputBrushSize');
inputBrushSize.addEventListener('change', function () {
    brushSize = parseInt(inputBrushSize.value);
});


const lableAnswer = document.querySelector('.lableAnswer');
const buttonClear = document.querySelector('.buttonClear');
buttonClear.addEventListener('mousedown', () => {
    for (let i = 0; i < outerField.length; i++) {
        outerField[i] = 0;
    }
    drawField();
})

let tileSize = 10;
let innerFieldSize = 20;
let outerFieldSize = 100;

let canvasTileSize = fieldCanvas.width/outerFieldSize;

let innerField = new Array(innerFieldSize * innerFieldSize);
let outerField = new Array(outerFieldSize * outerFieldSize);
let fieldDivs = new Array(outerFieldSize * outerFieldSize);

for (let i = 0; i < outerField.length; i++) {
    outerField[i] = 0;
}

let layers = [innerFieldSize * innerFieldSize, 512, 128, 10];
let weightMatrixes = new Array(layers.length);
let neuronOutputs = new Array(layers.length);

let brushSize = 4;
let isDrawing = false;

function onOpenCvReady() {
    cv['onRuntimeInitialized'] = () => {
        const mat = cv.matFromArray(outerFieldSize, outerFieldSize, cv.CV_8UC1, outerField);
        let newWidth = 100;
        let newHeight = 100;
        const dstMat = new cv.Mat();
        cv.resize(mat, dstMat, new cv.Size(newWidth, newHeight), 0, 0, cv.INTER_LINEAR);
        cv.imshow("outputCanvas", dstMat);
    };
}

function drawField()
{
    for (let i = 0; i < outerFieldSize; i++) {
        for (let j = 0; j < outerFieldSize; j++) {
            let color = 255 - outerField[i * outerFieldSize + j];
            ctx.fillStyle = `rgb(${color},${color},${color})`;
            ctx.fillRect (j*canvasTileSize, i * canvasTileSize, canvasTileSize, canvasTileSize)
        }
    }
}

function draw(event) {
    let x = event.clientX - fieldCanvas.getBoundingClientRect().left;
    let y = event.clientY - fieldCanvas.getBoundingClientRect().top;

    let tileX = parseInt(x / canvasTileSize);
    let tileY = parseInt(y / canvasTileSize);

    for (let i = tileX - brushSize; i <= tileX + brushSize; i++) {
        for (let j = tileY - brushSize; j <= tileY + brushSize; j++) {
            if (0 <= i && i < outerFieldSize && 0 <= i && j < outerFieldSize) {
                if (getLenght({ x: i, y: j }, { x: tileX, y: tileY }) < brushSize) {

                    // let l = getLenght({ x: i, y: j }, { x: tileX, y: tileY });
                    // outerField[j * outerFieldSize + i] = Math.max(255 * ((-0.2) * l * l * l + 1), outerField[j * outerFieldSize + i]);
                    // if (outerField[j * outerFieldSize + i] > 255) {
                    //     outerField[j * outerFieldSize + i] = 255;
                    // }
                    outerField[j * outerFieldSize + i] = 255;
                }
            }
        }
    }
    drawField();
    let ans = detectNumber();
    lableAnswer.textContent = "Answer: " + ans;
}

function createInputMatrix() {

    let numberField = outerField.slice();
    let numberField1 = outerField.slice();
    let numberFieldWidth = outerFieldSize;
    let numberFieldHeight = outerFieldSize;

    for (let i = 0; i < numberFieldHeight; i++) { // удалить пустые строки
        let stringSum = 0;
        for (let j = 0; j < numberFieldWidth; j++) {
            stringSum += numberField[i * numberFieldWidth + j];
        }
        if (stringSum == 0) {
            numberField.splice(i * numberFieldWidth, numberFieldWidth);
            numberFieldHeight--;
            i--;
        }
    }

    for (let i = 0; i < numberFieldWidth; i++) { // удалить пустые слобцы
        let colSum = 0;
        for (let j = 0; j < numberFieldHeight; j++) {
            colSum += numberField[j * numberFieldWidth + i];
        }
        if (colSum == 0) {
            for (let j = 0; j < numberFieldHeight; j++) {
                numberField.splice(j * numberFieldWidth + i - j, 1);
            }
            numberFieldWidth--;
            i--;
        }
    }

    let mat = cv.matFromArray(numberFieldHeight, numberFieldWidth, cv.CV_8UC1, numberField);

    if (numberFieldHeight > numberFieldWidth) {
        let factor = 20 / numberFieldHeight;
        numberFieldHeight = 20;
        numberFieldWidth = parseInt(Math.round(numberFieldWidth * factor))
        cv.resize(mat, mat, new cv.Size(numberFieldWidth, numberFieldHeight), 0, 0, cv.INTER_LINEAR)
    }
    else {
        let factor = 20 / numberFieldWidth;
        numberFieldWidth = 20;
        numberFieldHeight = parseInt(Math.round(numberFieldHeight * factor))
        cv.resize(mat, mat, new cv.Size(numberFieldWidth, numberFieldHeight), 0, 0, cv.INTER_LINEAR)
    }

    numberField = Array.from(mat.data.slice());

    let addRowsCount = 20 - numberFieldHeight; // 28
    let addColsCount = 20 - numberFieldWidth; // 28

    let addRowsUp = parseInt(addRowsCount / 2); // +1
    let addRowsDown = addRowsCount - addRowsUp;
    let addColsRight = parseInt(addColsCount / 2);
    let addColsLeft = addColsCount - addColsRight;

    for (let i = 0; i < addRowsDown; i++) { //добавить снизу

        for (let j = 0; j < numberFieldWidth; j++) {
            numberField.push(0);
        }
        numberFieldHeight++;
    }
    for (let i = 0; i < addRowsUp; i++) { // добавить сверху
        for (let j = 0; j < numberFieldWidth; j++) {
            numberField.splice(0, 0, 0);
        }
        numberFieldHeight++;
    }

    for (let i = numberFieldHeight - 1; i >= 0; i--) {
        for (let j = 0; j < addColsRight; j++) { // добавить справа
            numberField.splice(i * numberFieldWidth + numberFieldWidth, 0, 0)
        }
        for (let j = 0; j < addColsLeft; j++) { // добавить слева
            numberField.splice(i * numberFieldWidth, 0, 0)
        }
    }
    numberFieldWidth += addColsCount;

    mat = cv.matFromArray(numberFieldHeight, numberFieldWidth, cv.CV_8UC1, numberField);
    cv.resize(mat, mat, new cv.Size(100, 100), 0, 0, cv.INTER_LINEAR);
    cv.imshow("outputCanvas", mat);

    let matrix = [];
    for (let i = 0; i < numberField.length; i++) {
        matrix.push([numberField[i]]);
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
    drawField()
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
