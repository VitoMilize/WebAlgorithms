function getTable() {

  let matrix = document.querySelector(".matrix");
  while (matrix.firstChild) {
    matrix.removeChild(matrix.firstChild);
  }

  let sizeInput = document.getElementById("size");
  let size = parseInt(sizeInput.value);

  let arr = new Array(size);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(size);
  }

  let a1 = 0;
  let b1 = 0;

  let a2 = 0;
  let b2 = 0;

  //while ((a1 == a2 && Math.abs(b2 - b1) <= 1) || (b1 == b2 && Math.abs(a2 - a1) <= 1)) {
  while (a1 == a2 || b1 == b2) {

    let choose = Math.floor(Math.random() * 2);
    if (choose == 0) {
      choose = Math.floor(Math.random() * 2);
      if (choose = 0) {
        a1 = 0;
        b1 = Math.floor(Math.random() * size);
      }
      else {
        a1 = size - 1;
        b1 = Math.floor(Math.random() * size);
      }
    }
    else {
      choose = Math.floor(Math.random() * 2);
      if (choose = 0) {
        b1 = 0;
        a1 = Math.floor(Math.random() * size);
      }
      else {
        b1 = size - 1;
        a1 = Math.floor(Math.random() * size);
      }
    }

    choose = Math.floor(Math.random() * 2);
    if (choose == 0) {
      choose = Math.floor(Math.random() * 2);
      if (choose = 0) {
        a2 = 0;
        b2 = Math.floor(Math.random() * size);
      }
      else {
        a2 = size - 1;
        b2 = Math.floor(Math.random() * size);
      }
    }
    else {
      choose = Math.floor(Math.random() * 2);
      if (choose = 0) {
        b2 = 0;
        a2 = Math.floor(Math.random() * size);
      }
      else {
        b2 = size - 1;
        a2 = Math.floor(Math.random() * size);
      }
    }
  }

  for (let i = 0; i < size; i++) {
    let row = document.createElement("div");
    row.style.display = "flex";
    for (let j = 0; j < size; j++) {
      arr[i][j] = document.createElement("div");
      arr[i][j].style.width = "50px";
      arr[i][j].style.height = "50px";
      arr[i][j].style.border = "1px solid black";
      if (i == a1 && j == b1) {
        arr[a1][b1].style.background = "rgb(0, 255, 0)";
      }
      else if (i == a2 && j == b2) {
        arr[a2][b2].style.background = "rgb(255, 0, 0)";
      } else {
        if (Math.floor(Math.random() * 2) == 0) {
          arr[i][j].style.background = "rgb(255, 255, 255)";
        } else {
          arr[i][j].style.background = "rgb(0, 0, 0)";
        }
      }
      row.appendChild(arr[i][j]);
    }
    matrix.appendChild(row);
  }


}