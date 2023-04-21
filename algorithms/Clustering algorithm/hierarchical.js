function hierarchicalClustering(points, threshold) {
    let clusters = points.map(point => [point]);

    function distance(cluster1, cluster2) {
        let distances = [];
        for (let i = 0; i < cluster1.length; i++) {
            for (let j = 0; j < cluster2.length; j++) {
                let dist = Math.sqrt(Math.pow(cluster1[i].x - cluster2[j].x, 2) + Math.pow(cluster1[i].y - cluster2[j].y, 2));
                distances.push(dist);
            }
        }
        return distances.reduce((a, b) => a + b, 0) / distances.length;
    }

    while (clusters.length > 1) {
        let minDistance = Infinity;
        let closestClusters = [];
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i+1; j < clusters.length; j++) {
                let dist = distance(clusters[i], clusters[j]);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestClusters = [clusters[i], clusters[j]];
                }
            }
        }
        if (minDistance > threshold) {
            break;
        }
        clusters = clusters.filter(cluster => !closestClusters.includes(cluster));
        let newCluster = closestClusters[0].concat(closestClusters[1]);
        clusters.push(newCluster);
    }

    return clusters;
}
