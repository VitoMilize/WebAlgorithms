function generateRandomColorsBrightness() {
    return Math.floor(Math.random() * 256);
}

function generateRandomColor() {
    let red = generateRandomColorsBrightness();
    let green = generateRandomColorsBrightness();
    let blue = generateRandomColorsBrightness();
    return `rgb(${red}, ${green}, ${blue})`;
}

function drawNewPoint() {
    context.clearRect(0, 0, map.width, map.height);
    context.fillStyle = "black";

    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i].x, points[i].y, 15, 0, 2 * Math.PI);
        context.fill();
    }
}

function drawClusteredPoints(centroidsFromKMeans, clustersFromHierarchical, clustersFromDensity) {
    context.clearRect(0, 0, map.width, map.height);

    drawClusteredPointsByKMeans(centroidsFromKMeans);
    drawClusteredPointsByHierarchical(clustersFromHierarchical);
    drawClusteredPointsByDensity(clustersFromDensity);
}

function drawClusteredPointsByKMeans(centroids) {
    for (let i = 0; i < centroids.length; i++) {
        let cluster = points.filter(p => {
            let distances = centroids.map(c => getDistance(p, c));
            let closestCentroidIndex = distances.indexOf(Math.min(...distances));
            return closestCentroidIndex === i;
        });

        context.fillStyle = generateRandomColor();

        for (let j = 0; j < cluster.length; j++) {
            context.beginPath();
            context.arc(cluster[j].x, cluster[j].y, 15, 0, Math.PI);
            context.fill();
        }
    }
}

function drawClusteredPointsByHierarchical(clusters) {
    for (let i = 0; i < clusters.length; i++) {
        context.fillStyle = generateRandomColor();

        for (let j = 0; j < clusters[i].length; j++) {
            context.beginPath();
            context.arc(clusters[i][j].x, clusters[i][j].y, 15, Math.PI, 2 * Math.PI);
            context.fill();
        }
    }
}

function drawClusteredPointsByDensity(clusters) {
    for (let i = 0; i < clusters.length; i++) {
        context.fillStyle = generateRandomColor();

        for (let j = 0; j < clusters[i].length; j++) {
            context.beginPath();
            context.arc(clusters[i][j].x, clusters[i][j].y, 7, 0, 2 * Math.PI);
            context.fill();
        }
    }
}