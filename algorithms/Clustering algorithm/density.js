function densityClustering(points, eps, minPts) {
    let clusters = [];
    let visited = new Set();
    let noise = new Set();

    // функция для поиска всех точек в заданном радиусе
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

    // функция для расширения кластера
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

    // проходимся по всем точкам
    for (let i = 0; i < points.length; i++) {
        let point = points[i];

        // проверяем, была ли точка уже посещена
        if (!visited.has(point)) {
            visited.add(point);

            // ищем всех соседей в заданном радиусе
            let neighbors = regionQuery(point);

            // если количество соседей меньше minPts, то это шумовая точка
            if (neighbors.length < minPts) {
                noise.add(point);
            } else {
                // создаем новый кластер и расширяем его
                let cluster = [];
                clusters.push(cluster);
                expandCluster(point, cluster);
            }
        }
    }

    // возвращаем массив кластеров и шумовых точек
    return clusters;
}
