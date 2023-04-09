let map;
let context;
let buttonStart;
let points = [];
let clustersAmount;
let inputClustersAmount;
initMap();
initButtonStart();
initInputClustersAmount();
let colors = ["red", "blue", "green", "purple", "orange", "yellow", "pink", "purple", "gray", "brown"];

function initMap() {
    map = document.getElementById("map");
    map.width = map.offsetWidth;
    map.height = map.offsetHeight;
    context = map.getContext("2d");
    map.addEventListener("click", handleClick);
}

function initButtonStart() {
    buttonStart = document.getElementById("buttonStart");
    buttonStart.width = buttonStart.offsetWidth;
    buttonStart.height = buttonStart.offsetHeight;
    buttonStart.textContent = "Запуск";
    buttonStart.addEventListener("click", resultClick);
}

function initInputClustersAmount() {
    inputClustersAmount = document.getElementById("inputClustersAmount");
}

function handleClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    points.push({ x, y });
    console.log(x, y);

    context.clearRect(0, 0, map.width, map.height);
    context.fillStyle = "black";
    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI);
        context.fill();
    }
}

function resultClick() {
    clustersAmount = inputClustersAmount.value;
    if (inputClustersAmount.value > points.length) {
        inputClustersAmount.value = points.length;
        clustersAmount = inputClustersAmount.value;
    }
    let centroids = kMeansClustering(points, clustersAmount);

    context.clearRect(0, 0, map.width, map.height);

    for (let i = 0; i < centroids.length; i++) {
        let clusterPoints = points.filter(p => {
            let distances = centroids.map(c => getDistance(p, c));
            let closestCentroidIndex = distances.indexOf(Math.min(...distances));
            return closestCentroidIndex === i;
        });

        context.fillStyle = colors[i];

        for (let j = 0; j < clusterPoints.length; j++) {
            context.beginPath();
            context.arc(clusterPoints[j].x, clusterPoints[j].y, 5, 0, 2 * Math.PI);
            context.fill();
        }
    }
}

function kMeansClustering(points, k) {
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(points[Math.floor(Math.random() * points.length)]);
    }

    let iterations = 0;
    let oldCentroids;

    while (!oldCentroids || !centroidsEqual(oldCentroids, centroids)) {
        let clusters = {};
        for (let i = 0; i < points.length; i++) {
            let distances = centroids.map(c => getDistance(points[i], c));
            let closestCentroidIndex = distances.indexOf(Math.min(...distances));
            if (!clusters[closestCentroidIndex]) clusters[closestCentroidIndex] = [];
            clusters[closestCentroidIndex].push(points[i]);
        }

        oldCentroids = centroids;
        centroids = [];
        for (let i = 0; i < k; i++) {
            if (clusters[i]) {
                let centroid = clusters[i].reduce((acc, cur) => addPoints(acc, cur));
                centroid = dividePoint(centroid, clusters[i].length);
                centroids.push(centroid);
            } else {
                centroids.push(oldCentroids[i]);
            }
        }

        iterations++;
    }

    return centroids;
}

function centroidsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].x !== b[i].x || a[i].y !== b[i].y) return false;
    }
    return true;
}

function getDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y));
}

function addPoints(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}

function dividePoint(p, n) {
    return { x: p.x / n, y: p.y / n };
}

