let dataset;

let layerSizes = [32, 16, 10];

function loadDataset() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                dataset = xhr.responseText;
                resolve();
            }
        };
        xhr.open('GET', './mnist_test.csv');
        xhr.send();
    });
}

// loadDataset()
//     .then(() => {
//         lern();
//     })
//     .catch((error) => {
//         console.error('Ошибка загрузки данных:', error);
//     });

A = [[0.3, 0.7, 0.5],
[0.6, 0.5, 0.2],
[0.8, 0.1, 0.9]];

B = [[0.761],
[0.603],
[0.650]];

function saveToPC(str){
    let blob = new Blob([str], {type: "text/plain"});
    let link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", Date.now()+"");
    link.click();
}


async function getFile() {
    // Open file picker and destructure the result the first handle
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    return file;
}
getFile();
console.log(A);
console.log(B);
console.log(MultiplyMatrix(A, B));

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


function lern() {
    const rows = dataset.split('\n');
    console.log(rows[1]);
}