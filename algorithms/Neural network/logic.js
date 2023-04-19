const fieldRoot = document.querySelector('.field');
fieldRoot.addEventListener('mousedown', draw);
let tileSize = 10;
let fieldSize = 28;
let fieldDivsSize = 28;

let field = new Array(fieldSize*fieldSize);
let fieldDivs = new Array(fieldDivsSize*fieldDivsSize);

let layers = [fieldSize * fieldSize, 512, 128, 10];
let weightMatrixes = new Array(layers.length);

function addDivsToDisplay()
{
    for (let i = 0; i < fieldDivsSize; i++) {
        let row = document.createElement("div");
        row.style.display = "flex";
        //row.style.display = "inline-block";
        //row.style.justifyContent = "center";
        for (let j = 0; j < fieldDivsSize; j++) {
            let tile = document.createElement("div");
            tile.style.width = tileSize + 'px';            
            tile.style.height = tileSize + 'px'; 
            tile.style.background = "rgb(0, 0, 0)";
            fieldDivs.push(tile);
            row.appendChild(tile);
        }
        fieldRoot.appendChild(row);
    }
    fieldRoot.style.width = fieldDivsSize * tileSize + 'px';
    fieldRoot.style.height = fieldDivsSize * tileSize + 'px';
}

function draw(event)
{
    let x = event.clientX - fieldRoot.getBoundingClientRect().left;
    let y = event.clientY - fieldRoot.getBoundingClientRect().top;
    console.log(x, y)
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

loadWeights().then(()=>{
    addDivsToDisplay();
    console.log("dfdf")
})
















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


