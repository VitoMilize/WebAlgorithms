function drawNewPoint() {
    context.clearRect(0, 0, map.width, map.height);

    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i].x, points[i].y, 7, 0, 2 * Math.PI);
        context.fill();
    }
}

function drawPath(gnome) {
    context.clearRect(0, 0, map.width, map.height);
    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i].x, points[i].y, 7, 0, 2 * Math.PI);
        context.fill();
    }
    for (let i = 1; i < gnome.length; i++) {
        context.beginPath();
        context.moveTo(points[gnome[i - 1]].x, points[gnome[i - 1]].y);
        context.lineTo(points[gnome[i]].x, points[gnome[i]].y);
        context.closePath();
        context.stroke();
    }
}