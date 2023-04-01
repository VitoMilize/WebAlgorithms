  let map = new Array(size);
  function CreateMaze() {
    let matrix = document.querySelector(".matrix");
    while (matrix.firstChild) {
      matrix.removeChild(matrix.firstChild);
    }
    let sizeInput = document.getElementById("size");
    let size = parseInt(sizeInput.value);
    if (size % 2 == 0) {
      size++;
    }

    //создаем матрицу и заполняем стенами (1)
    let check = new Array(size);
    for (let i = 0; i < size; i++) {
      map[i] = new Array(size);
      check[i] = new Array(size);
      for (let j = 0; j < size; j++) {
        map[i][j] = 1;
        check[i][j] = 0;
      }
    }
    //выбираем ячейку, где не будет стены
    let x = Math.floor(Math.random() * (size / 2)) * 2 + 1;
    let y = Math.floor(Math.random() * (size / 2)) * 2 + 1;

    map[x][y] = 0;
    //создаем массив с x и массив с y
    let arrX = new Array();
    let arrY = new Array();
    //в них буду лежать ячейку с расстояние 2 от начальной
    if (y - 2 >= 0) {
      arrX.push(x);
      arrY.push(y - 2);
    }
    if (y + 2 < size) {
      arrX.push(x);
      arrY.push(y + 2);
    }
    if (x - 2 >= 0) {
      arrX.push(x - 2);
      arrY.push(y);
    }
    if (x + 2 < size) {
      arrX.push(x + 2);
      arrY.push(y);
    }

    //Пока в вашем растущем массиве есть ячейки, выберите одну наугад, очистите ее и удалите из растущего массива.
    while (arrX.length > 0 && arrY.length > 0) {
      let index = Math.floor(Math.random() * arrX.length);
      x = arrX[index];
      y = arrY[index];
      map[x][y] = 0;
      arrX.splice(index, 1);
      arrY.splice(index, 1);

      // Ячейка, которую вы только что очистили, должна быть соединена с другой очищенной ячейкой.
      // Посмотрите на два ортогональных пробела в стороне от ячейки, которую вы только что очистили, пока не найдете ту, которая не является стеной.
      // Очистите ячейку между ними.
      //////////////////////////////////////////////////////////////
      let d = new Array(0, 1, 2, 3);
      if (check[x][y] == 1) {
        continue;
      }
      while (d.length > 0) {
        let dir_index = Math.floor(Math.random() * d.length);
        switch (d[dir_index]) {
          case 0:
            if (y - 2 >= 0 && map[x][y - 2] == 0) {
              map[x][y - 1] = 0;
              d.splice(0, d.length);
            }
            break;
          case 1:
            if (y + 2 < size && map[x][y + 2] == 0) {
              map[x][y + 1] = 0;
              d.splice(0, d.length);
            }
            break;
          case 2:
            if (x - 2 >= 0 && map[x - 2][y] == 0) {
              map[x - 1][y] = 0;
              d.splice(0, d.length);
            }
            break;
          case 3:
            if (x + 2 < size && map[x + 2][y] == 0) {
              map[x + 1][y] = 0;
              d.splice(0, d.length);
            }
            break;
        }
        d.splice(dir_index, 1);
      }
      check[x][y] = 1;
      // Добавьте допустимые ячейки, которые находятся на расстоянии двух ортогональных пробелов от ячейки, которую вы очистили.
      if (y - 2 >= 0 && map[x][y - 2] == 1) {
        arrX.push(x);
        arrY.push(y - 2);
      }
      if (y + 2 < size && map[x][y + 2] == 1) {
        arrX.push(x);
        arrY.push(y + 2);
      }
      if (x - 2 >= 0 && map[x - 2][y] == 1) {
        arrX.push(x - 2);
        arrY.push(y);
      }
      if (x + 2 < size && map[x + 2][y] == 1) {
        arrX.push(x + 2);
        arrY.push(y);
      }
    }

    map[1][1] = 2;
    map[size - 2][size - 2] = 3;

    for (let i = 0; i < size; i++) {
      let row = document.createElement("div");
      row.style.display = "flex";
      for (let j = 0; j < size; j++) {
        let cell;
        cell = document.createElement("div");
        cell.style.width = 612 / size + "px";
        cell.style.height = 612 / size + "px";
        if (map[i][j] == 0) {
          cell.style.background = "rgb(255, 255, 255)";
        }
        else if (map[i][j] == 1) {
          cell.style.background = "rgb(0, 0, 0)";
        }
        else if (map[i][j] == 2) {
          cell.style.background = "rgb(0, 255, 0)";
        }
        else {
          cell.style.background = "rgb(255, 0, 0)";
        }
        row.appendChild(cell);
      }
      matrix.appendChild(row);
    }
  }

  function searchWay() {
    let sizeInput = document.getElementById("size");
    let size = parseInt(sizeInput.value);
    if (size % 2 == 0) {
      size++;
    }

    //необходимо перевести map сюда
    let check = new Array(size);
    let way = new Array(size)
    for (let i = 0; i < size; i++) {
      check[i] = new Array(size);
      way[i] = new Array(size);
      for (let j = 0; j < size; j++) {
        check[i][j] = 0;
      }
    }
    way[1][1] = 5;

    let queueX = new Array();
    let queueY = new Array();
    queueX.push(1);
    queueY.push(1);

    let x;
    let y;
    while (queueX.length != 0) {
      x = queueX[0];
      y = queueY[0];
      check[x][y] = 1;
      queueX.splice(0, 1);
      queueY.splice(0, 1);
      if ((map[x + 1][y] == 0 || map[x + 1][y] == 3) && check[x + 1][y] == 0) {
        queueX.push(x + 1);
        queueY.push(y);
        way[x + 1][y] = 1;
      }
      if ((map[x - 1][y] == 0 || map[x - 1][y] == 3) && check[x - 1][y] == 0) {
        queueX.push(x - 1);
        queueY.push(y);
        way[x - 1][y] = 3;
      }
      if ((map[x][y - 1] == 0 || map[x][y - 1] == 3) && check[x][y - 1] == 0) {
        queueX.push(x);
        queueY.push(y - 1);
        way[x][y - 1] = 2;
      }
      if ((map[x][y + 1] == 0 || map[x][y + 1] == 3) && check[x][y + 1] == 0) {
        queueX.push(x);
        queueY.push(y + 1);
        way[x][y + 1] = 4;
      }

      if (check[size - 2][size - 2] == 1) {
        break;
      }
    }

    x = size - 2;
    y = size - 2;
    while (true) {
      if (way[x][y] == 1) {
        map[x][y] = 4;
        x = x - 1;
      }
      else if (way[x][y] == 2) {
        map[x][y] = 4;
        y = y + 1;
      }
      else if (way[x][y] == 3) {
        map[x][y] = 4;
        x = x + 1;
      }
      else if (way[x][y] == 4) {
        map[x][y] = 4;
        y = y - 1;
      }
      else if (x == 1 && y == 1) {
        map[x][y] = 4;
        break;
      }

    }
    let matrix = document.querySelector(".matrix"); // получаем объект матрицы по ID
    let rows = matrix.children; // получаем строки матрицы
    for (let i = 0; i < rows.length; i++) {
      let cells = rows[i].children; // получаем ячейки в каждой строке
      for (let j = 0; j < cells.length; j++) {
        if (map[i][j] == 4) { // если значение в матрице равно 4
          cells[j].style.background = "rgb(255, 255, 0)";; // изменяем цвет ячейки на желтый
        }
      }
    }
    rows[0][0].style.background = "rgb(255, 255, 255)";

    // for (let i = 0; i < size; i++) {
    //   let row = document.createElement("div");
    //   row.style.display = "flex";
    //   for (let j = 0; j < size; j++) {
    //     let cell;
    //     cell = document.createElement("div");
    //     cell.style.width = 612 / size + "px";
    //     cell.style.height = 612 / size + "px";
    //     if (map[i][j] == 0) {
    //       cell.style.background = "rgb(255, 255, 255)";
    //     }
    //     else if (map[i][j] == 1) {
    //       cell.style.background = "rgb(0, 0, 0)";
    //     }
    //     else if (map[i][j] == 2) {
    //       cell.style.background = "rgb(0, 255, 0)";
    //     }
    //     else if (map[i][j] == 3) {
    //       cell.style.background = "rgb(255, 0, 0)";
    //     }
    //     else {
    //       cell.style.background = "rgb(255, 255, 0)";
    //     }
    //     row.appendChild(cell);
    //   }
    //   maze.appendChild(row);
    // }

  }