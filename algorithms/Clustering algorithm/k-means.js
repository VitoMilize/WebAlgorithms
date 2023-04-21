function getDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y));
}

function additionPoints(point1, point2) {
    return { x: point1.x + point2.x, y: point1.y + point2.y };
}

function dividePoint(point, number) {
    return { x: point.x / number, y: point.y / number };
}

function centroidsEqual(centroid1, centroid2) {
    if (centroid1.length !== centroid2.length)
        return false;
    for (let i = 0; i < centroid1.length; i++)
        if (centroid1[i].x !== centroid2[i].x || centroid1[i].y !== centroid2[i].y)
            return false;
    return true;
}

function kMeansClustering(points, clustersAmount) {
    let centroids = [];
    for (let i = 0; i < clustersAmount; i++) {
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
        for (let i = 0; i < clustersAmount; i++) {
            if (clusters[i]) {
                let centroid = clusters[i].reduce((acc, cur) => additionPoints(acc, cur));
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