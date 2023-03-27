function getTable() {
    let matrix = document.querySelector(".matrix");
  
    let sizeInput = document.getElementById("size");
    let size = parseInt(sizeInput.value);
  
    let arr = new Array(size);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(size);
    }
  
    for (let i = 0; i < size; i++) {
      let row = document.createElement("div");
      row.style.display = "flex";
      for (let j = 0; j < size; j++) {
        arr[i][j] = document.createElement("div");
        arr[i][j].style.width = "50px";
        arr[i][j].style.height = "50px";
        arr[i][j].style.background = "rgb(255, 255, 255)";
        arr[i][j].style.border = "1px solid black";
        //arr[i][j].style.margin = "2px";
        row.appendChild(arr[i][j]);
      }
      matrix.appendChild(row);
    }
  }