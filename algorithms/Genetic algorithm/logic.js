let map;
let context;
let buttonStart;
let points = [];
initMap();
initButtonStart();

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
    TSPUtil();
}



