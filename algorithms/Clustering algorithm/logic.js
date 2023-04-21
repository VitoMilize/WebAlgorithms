let map;
let context;
let buttonStart;
let points = [];
let clustersAmount;
let inputClustersAmount;
let threshold;
let inputThreshold;
let neighborsRadius;
let inputNeighborsRadius;
let neighborsAmount;
let inputNeighborsAmount;
initMap();
initButtonStart();
initInputClustersAmount();
initInputThreshold();
initInputNeighborsRadius();
initInputNeighborsAmount();

function initMap() {
    map = document.getElementById("map");
    map.width = map.offsetWidth;
    map.height = map.offsetHeight;
    context = map.getContext("2d");
    map.addEventListener("click", handleClick);
}

function handleClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    points.push({ x, y });

    drawNewPoint();
}

function initButtonStart() {
    buttonStart = document.getElementById("start button");
    buttonStart.addEventListener("click", resultClick);
}

function resultClick() {
    clustersAmount = inputClustersAmount.value;
    threshold = inputThreshold.value;
    neighborsRadius = inputNeighborsRadius.value;
    neighborsAmount = inputNeighborsAmount.value;
    drawClusteredPoints(kMeansClustering(points, clustersAmount), hierarchicalClustering(points, threshold), densityClustering(points, neighborsRadius, neighborsAmount));
}

function initInputClustersAmount() {
    inputClustersAmount = document.getElementById("input clusters amount");
}

function initInputThreshold() {
    inputThreshold = document.getElementById("input threshold");
}

function initInputNeighborsRadius() {
    inputNeighborsRadius = document.getElementById("input neighbors radius");
}

function initInputNeighborsAmount() {
    inputNeighborsAmount = document.getElementById("input neighbors amount");
}

