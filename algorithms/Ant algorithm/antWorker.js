let antTarget = { home: 'home', food: 'food' };
let sniffRange = 5;
let markerIntensity = 100;
function transitionProb1(antX, antY, dir, tileX, tileY, marker1, clock) {
  let dirVec = { x: Math.cos(dir), y: Math.sin(dir) };
  let tileVec = { x: tileX - antX, y: tileY - antY };
  let scalar = dirVec.x * tileVec.x + dirVec.y * tileVec.y;
  let modul = Math.sqrt(tileVec.x * tileVec.x + tileVec.y * tileVec.y);
  let angle = Math.acos(scalar / modul);
  return (1 - angle / Math.PI) + marker1 / 255 * (Math.random() * 1.7 - 0.7) //* (1-Math.exp(-0.05*clock))  //- marker2/255*0.5;
}

function angleVectors(x1, y1, x2, y2) {
  let scalar = x1 * x2 + y1 * y2;
  let modul1 = Math.sqrt(x1 * x1 + y1 * y1);
  let modul2 = Math.sqrt(x2 * x2 + y2 * y2);
  let angle = Math.acos(scalar / (modul1 * modul2));
  if (y2 < 0) angle = -angle;
  return angle;
}

function getMarker(x, y, field, fieldSizeX, fieldSizeY, color) {
  if (x < 0 || x >= fieldSizeX || y < 0 || y >= fieldSizeY) return 0;
  if (color == 'r') return field[(y * fieldSizeX + x) * 3];
  else return field[(y * fieldSizeX + x) * 3 + 2];
}

self.onmessage = function (event) {
  const { chunk, field, fieldSizeX, fieldSizeY, objId } = event.data;
  while (true) {
    const result = [];
    for (let i = 0; i < chunk.length; i++) {
      const ant = chunk[i];

      let x = Math.ceil(ant.pos.x)
      let y = Math.ceil(ant.pos.y)


      if (field[(y * fieldSizeX + x) * 3 + 1] == objId.food && ant.target == antTarget.food) {
        ant.target = antTarget.home;
        ant.dir -= Math.PI;
        ant.clock = 0;
      }
      if (field[(y * fieldSizeX + x) * 3 + 1] == objId.home && ant.target == antTarget.home) {
        ant.target = antTarget.food;
        ant.dir -= Math.PI;
        ant.clock = 0;
      }

      if (ant.target == antTarget.food) {
        field[(y * fieldSizeX + x) * 3] += markerIntensity * (100 / ant.clock);
        //field[(y*fieldSizeX+x)*3] += markerIntensity * Math.exp(-0.005 * ant.clock);
        //field[(y*fieldSizeX+x)*3] = Math.max(field[(y*fieldSizeX+x)*3], markerIntensity * Math.exp(-0.005 * ant.clock));
        if (field[(y * fieldSizeX + x) * 3] > 255) field[(y * fieldSizeX + x) * 3] = 255;
      }
      else {
        field[(y * fieldSizeX + x) * 3 + 2] += markerIntensity * (100 / ant.clock);
        //field[(y*fieldSizeX+x)*3 + 2] += markerIntensity * Math.exp(-0.005 * ant.clock);
        //field[(y*fieldSizeX+x)*3 + 2] = Math.max(field[(y*fieldSizeX+x)*3 + 2], markerIntensity * Math.exp(-0.005 * ant.clock));
        if (field[(y * fieldSizeX + x) * 3 + 2] > 255) field[(y * fieldSizeX + x) * 3 + 2] = 255;
      }

      // ant.dir += (Math.random() - 0.5) * Math.PI/8;

      let maxProb = 0;
      let tile;
      for (let i = x - sniffRange; i <= x + sniffRange; i++) {
        for (let j = y - sniffRange; j <= y + sniffRange; j++) {
          if (i == x && j == y) continue;
          if (-1 <= i && i < fieldSizeX + 1 && -1 <= j && j < fieldSizeY + 1) {
            let marker1, marker2;
            if (ant.target == antTarget.food) {
              marker1 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'b')
              marker2 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'r')
            }
            else {
              marker1 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'r')
              marker2 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'b')
            }
            let prob = transitionProb1(x, y, ant.dir, i, j, marker1);
            if (prob > maxProb) {
              maxProb = prob;
              tile = { x: i, y: j };
            }
          }
        }
      }


      ant.dir = angleVectors(1, 0, tile.x - x, tile.y - y);
      ant.dir += (Math.random() - 0.5) * Math.PI / 8;

      let newPosX = ant.pos.x + Math.cos(ant.dir) * ant.speed;
      let newPosY = ant.pos.y + Math.sin(ant.dir) * ant.speed;


      if (0 <= newPosX && newPosX < fieldSizeX - 1) {
        ant.pos.x = newPosX;
      }
      else {
        if (Math.sin(ant.dir) < 0)
          ant.dir = Math.PI * 2 - Math.acos(-Math.cos(ant.dir));
        else
          ant.dir = Math.acos(-Math.cos(ant.dir));
      }
      if (0 <= newPosY && newPosY < fieldSizeY - 1) {
        ant.pos.y = newPosY;
      }
      else {
        ant.dir = -ant.dir;
      }

      ant.clock++;

      result.push(ant);
    }

    self.postMessage(result);
  }
};
