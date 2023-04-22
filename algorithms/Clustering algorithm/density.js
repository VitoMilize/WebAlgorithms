function densityClustering(points, eps, minPts) {
    let clusters = [];
    let visited = new Set();
    let noise = new Set();

    function regionQuery(point) {
        let neighbors = [];
        for (let i = 0; i < points.length; i++) {
            let distance = Math.sqrt((point.x - points[i].x) ** 2 + (point.y - points[i].y) ** 2);
            if (distance <= eps) {
                neighbors.push(points[i]);
            }
        }
        return neighbors;
    }

    function expandCluster(point, cluster) {
        cluster.push(point);
        visited.add(point);

        let neighbors = regionQuery(point);
        if (neighbors.length >= minPts) {
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];
                if (!visited.has(neighbor)) {
                    expandCluster(neighbor, cluster);
                }
            }
        }
    }

    for (let i = 0; i < points.length; i++) {
        let point = points[i];

        if (!visited.has(point)) {
            visited.add(point);

            let neighbors = regionQuery(point);

            if (neighbors.length < minPts) {
                noise.add(point);
            } else {
                let cluster = [];
                clusters.push(cluster);
                expandCluster(point, cluster);
            }
        }
    }

    return clusters;
}
