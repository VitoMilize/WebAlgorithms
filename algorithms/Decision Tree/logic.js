const colors = ['green', 'blue', 'red', 'yellow', 'orange', 'purple', 'pink', 'brown', 'grey', 'black', 'white', 'cyan', 'magenta', 'lime', 'olive', 'maroon', 'navy', 'teal', 'silver', 'gold', 'coral', 'lavender', 'turquoise', 'violet', 'indigo', 'beige', 'mint'];
function csvToTree(csv) {
  csv = csv;
  let lines = csv.split("\n");
  let headers = lines[0].split(",").map(function (header) { return header.trim(); });
  let root = { title: headers[0], children: [] };
  for (let i = 1; i < lines.length; i++) {
    let cols = lines[i].split(",");
    let currentNode = root;
    for (let j = 0; j < cols.length; j++) { 
      let col = cols[j];
      let existingChild = currentNode.children.find(function (child) {
        return child.title === headers[j] && child.value === col;
      });
      if (existingChild) {
        currentNode = existingChild;
      } else {
        let newChild = { title: headers[j], value: col, children: [] };
        currentNode.children.push(newChild);
        currentNode = newChild;
      }
    }
  }
  return root.children;
}
let index = 0;
function buildTreeSearch(data, parent, searchData) {
  let ul = document.createElement('ul');
  if (parent) {
    parent.appendChild(ul);
  } else {
    document.querySelector('#tree').appendChild(ul);
  }
  data.forEach(function (item) {
    let li = document.createElement('li');
    li.textContent = item.title + ': ' + item.value;
    // если элемент найден, закрасить его ячейки желтым цветом
    if (item.value === searchData[index]) {
      li.style.backgroundColor = colors[index];
      index = index + 1;
    }
    ul.appendChild(li);
    if (item.children && item.children.length) {
      buildTreeSearch(item.children, li, searchData);
    }
  });
}

document.querySelector('#searchBtn').addEventListener('click', function () {
  let searchData = document.querySelector('#csvSearch').value.split(",");
  let csv = document.querySelector('#csvInput').value;
  let data = csvToTree(csv);
  document.querySelector('#tree').innerHTML = '';
  index = 0;
  buildTreeSearch(data, null, searchData);
});




function buildTree(data, parent) {
  let index = 0;
  let ul = document.createElement('ul');
  if (parent) {
    parent.appendChild(ul);
  } else {
    document.querySelector('#tree').appendChild(ul);
  }
  data.forEach(function (item) {
    let li = document.createElement('li');
    li.textContent = item.title + ': ' + item.value;
    ul.appendChild(li);
    if (item.children && item.children.length) {
      buildTree(item.children, li);
    }
  });
}

document.querySelector('#buildTreeBtn').addEventListener('click', function () {
  let csv = document.querySelector('#csvInput').value;
  let data = csvToTree(csv);
  document.querySelector('#tree').innerHTML = '';
  buildTree(data);
});