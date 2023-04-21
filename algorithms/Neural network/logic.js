const fieldRoot = document.querySelector('.field');
fieldRoot.addEventListener('mousedown', function (event) { isDrawing = true; draw(event); });
fieldRoot.addEventListener('mousemove', function (event) { if (isDrawing) { draw(event); } });
fieldRoot.addEventListener('mouseup', function () { isDrawing = false; });
fieldRoot.addEventListener('mouseleave', function () { isDrawing = false; });
const lableAnswer = document.querySelector('.lableAnswer');
const buttonClear = document.querySelector('.buttonClear');
const nextButton = document.querySelector('.nextButton');
buttonClear.addEventListener('mousedown', () => {
    for (let i = 0; i < outerField.length; i++) {
        outerField[i] = 0;
    }
    updateFiedlDivs();
})
nextButton.addEventListener('mousedown', () => {
    let rows = data.split('\n');
    let numbers = rows[0].split(',');

    //while (numbers[0] != '9') {
        numbers = rows[k].split(',');
        k++;
    //}

    for (let i = 0; i < outerField.length; i++) {
        outerField[i] = parseInt(numbers[i + 1]);
    }
    updateFiedlDivs();
    let ans = detectNumber();
    lableAnswer.textContent = "Answer: " + ans;
})
let tileSize = 10;
let innerFieldSize = 20;
let outerFieldSize = 50;

let innerField = new Array(innerFieldSize * innerFieldSize);
let outerField = new Array(outerFieldSize * outerFieldSize);
let fieldDivs = new Array(outerFieldSize * outerFieldSize);

let layers = [innerFieldSize * innerFieldSize, 512, 128, 10];
let weightMatrixes = new Array(layers.length);
let neuronOutputs = new Array(layers.length);

let brushSize = 2;
let isDrawing = false;

function onOpenCvReady() {
    cv['onRuntimeInitialized'] = () => {
        console.log("load")
        const matData = Array(100 * 100);
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                matData[i * 100 + j] = j * 2;
            }
        }

        const mat = cv.matFromArray(outerFieldSize, outerFieldSize, cv.CV_8UC1, outerField);

        let newWidth = 100;
        let newHeight = 100;
        const dstMat = new cv.Mat();

        cv.resize(mat, dstMat, new cv.Size(newWidth, newHeight), 0, 0, cv.INTER_LINEAR);
        cv.imshow("outputCanvas", dstMat);
    };
}

function addDivsToDisplay() {
    for (let i = 0; i < outerFieldSize; i++) {
        let row = document.createElement("div");
        row.style.display = "flex";
        for (let j = 0; j < outerFieldSize; j++) {
            let tile = document.createElement("div");
            tile.style.width = tileSize + 'px';
            tile.style.height = tileSize + 'px';
            tile.style.background = "rgb(255, 255, 255)";
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

                    let l = getLenght({ x: i, y: j }, { x: tileX, y: tileY });
                    outerField[j * outerFieldSize + i] = Math.max(255 * ((-0.2) * l * l * l + 1), outerField[j * outerFieldSize + i]);
                    // if (outerField[j * outerFieldSize + i] > 255) {
                    //     outerField[j * outerFieldSize + i] = 255;
                    // }
                    //outerField[j * outerFieldSize + i] = 255;
                }
            }
        }
    }
    updateFiedlDivs();
    let ans = detectNumber();
    lableAnswer.textContent = "Answer: " + ans;
    //console.log(ans);
}

function findCenterOfMass(field, sizeX, sizeY) {
    let totalMass = 0;
    let sumOverX = 0, sumOverY = 0;

    for (let i = 0; i < sizeX * sizeY; i++) {
        totalMass += field[i];
    }

    for (let i = 0; i < sizeY; i++) {
        for (let j = 0; j < sizeX; j++) {
            sumOverY += i * field[i * sizeX + j];
            sumOverX += j * field[i * sizeX + j];
        }
    }

    let cx = sumOverX / totalMass;
    let cy = sumOverY / totalMass;
    return { x: cx, y: cy };
}

function createInputMatrix() {

    let numberField = outerField.slice();
    let numberField1 = outerField.slice();
    let numberFieldWidth = outerFieldSize;
    let numberFieldHeight = outerFieldSize;

    //let cc = findCenterOfMass(numberField, numberFieldWidth, numberFieldHeight);
    //console.log(cc);

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

    // let center = findCenterOfMass(numberField, numberFieldWidth, numberFieldHeight);
    // let shiftX = Math.round(numberFieldWidth / 2 - center.x);
    // let shiftY = Math.round(numberFieldHeight / 2 - center.y);
    // let Mdata = [1, 0, shiftX, 0, 1, shiftY]
    // let M = cv.matFromArray(2, 3, cv.CV_32FC1, Mdata)
    // cv.warpAffine(mat, mat, M, new cv.Size(numberFieldWidth, numberFieldHeight));

    cv.imshow("outputCanvas", mat);
    //console.log("show")

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
        //console.log(i + ": " + neuronOutputs[neuronOutputs.length - 1][i][0])
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

// let data;
// function loadData() {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.onreadystatechange = function () {
//             if (xhr.readyState === 4 && xhr.status === 200) {
//                 data = xhr.responseText;
//                 resolve();
//             }
//         };
//         xhr.open('GET', './mnist_test.csv');
//         xhr.send();
//     });
// }

// let k = 0;

// loadData()
//     .then(() => {
//         let rows = data.split('\n');
//         let numbers = rows[0].split(',');

//         //while (numbers[0] != '9') {
//             numbers = rows[k].split(',');
//             k++;
//         //}

//         for (let i = 0; i < outerField.length; i++) {
//             outerField[i] = parseInt(numbers[i + 1]);
//         }
//         updateFiedlDivs();
//         let ans = detectNumber();
//         lableAnswer.textContent = "Answer: " + ans;
//     })




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
