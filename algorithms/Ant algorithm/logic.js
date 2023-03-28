function drawField(a)
{
    field[Math.floor(a/fieldHeigth)][a%fieldWidth] = 255;
    for (let i = 0; i < fieldHeigth; i++) {
        for (let j = 0; j < fieldWidth; j++) {
            cnt.fillStyle = `rgb(${field[i][j]}, 0, 0)`;
            cnt.fillRect(j*tileSize, i*tileSize, tileSize, tileSize);
        }    
    }
    a++;
    if (a < fieldHeigth*fieldWidth) {
    drawField(a);
    }
}

function canvasClicked(event)
{
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    field[Math.floor(y/tileSize)][Math.floor(x/tileSize)] = 255;
    drawField();
    console.log(x + " " + y);
}

const canvas = document.querySelector('.canvas');
canvas.addEventListener('mousedown', canvasClicked);
const cnt = canvas.getContext('2d');
const tileSize = 10;
const fieldWidth = 100, fieldHeigth = 100;

let field = new Array(fieldHeigth);
for (let i = 0; i < fieldHeigth; i++) {
    field[i] = new Array(fieldWidth);  
}

for (let i = 0; i < fieldHeigth; i++) {
    for (let j = 0; j < fieldWidth; j++) {
        field[i][j] = 0;
    }    
}



drawField(0);
