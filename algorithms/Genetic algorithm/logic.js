let map;
let context;
let button;
let points = [];
let path = [];
initMap();
initButton();

function initMap() {
    map = document.querySelector(".map");
    map.width = map.offsetWidth;
    map.height = map.offsetHeight;
    context = map.getContext("2d");
    map.addEventListener("click", handleClick);
}

function handleClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    points.push({ x, y });
    console.log(x, y);

    context.clearRect(0, 0, map.width, map.height);
    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i].x, points[i].y, 2, 0, 2 * Math.PI);
        context.fill();
    }
}

function initButton() {
    button = document.querySelector(".button");
    button.width = button.offsetWidth;
    button.height = button.offsetHeight;
    button.textContent = "Запуск";
    button.addEventListener("click", resultClick);
}
function resultClick() {
    path = tsp(points);
    console.log(path);
}

function getDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x)**2 + (point1.y - point2.y)**2);
}

// function createAdjacencyMatrix() {
//     const size = points.size;
//     const matrix = new Array(size);
//
//     for (let i = 0; i < size; i++) {
//         matrix[i] = new Array(size);
//         for (let j = 0; j < size; j++)
//             matrix[i][j] = i === j ? 0 : distanceBetweenPoints(points[i], points[j]);
//     }
//
//     return matrix;
// }

function tsp(points) {
    const n = points.length;
    const visited = new Array(n).fill(false);
    visited[0] = true;

    let current = 0;
    let path = [current];
    let length = 0;

    for (let i = 0; i < n - 1; i++) {
        let nearest = -1;
        let minDistance = Infinity;

        for (let j = 0; j < n; j++) {
            if (!visited[j]) {
                const distance = getDistance(points[current], points[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = j;
                }
            }
        }

        visited[nearest] = true;
        path.push(nearest);
        length += minDistance;
        current = nearest;
        for (let j = 0; j < path.length - 1; j++) {
            context.beginPath();
            context.moveTo(points[path[j]].x, points[path[j]].y);
            context.lineTo(points[path[j + 1]].x, points[path[j + 1]].y);
            context.stroke();
        }
    }

    return path;
}


