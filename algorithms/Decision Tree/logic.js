function buildTree(data, parent) {
  var ul = document.createElement('ul');
  if (parent) {
    parent.appendChild(ul);
  } else {
    document.querySelector('#tree').appendChild(ul);
  }
  data.forEach(function (item) {
    var li = document.createElement('li');
    li.textContent = item.title + ': ' + item.value;  // здесь изменено свойство, заданное при создании узла
    //li.textContent = item.value;
    ul.appendChild(li);
    if (item.children && item.children.length) {
      buildTree(item.children, li);
    }
  });
}

function csvToTree(csv) {
  csv = csv;
  var lines = csv.split("\n");
  var headers = lines[0].split(",").map(function (header) { return header.trim(); });
  var root = { title: headers[0], children: [] };
  for (var i = 1; i < lines.length; i++) {
    var cols = lines[i].split(",");
    var currentNode = root;
    for (var j = 0; j < cols.length; j++) {
      var col = cols[j];
      var existingChild = currentNode.children.find(function (child) {
        return child.title === headers[j] && child.value === col;
      });
      if (existingChild) {
        currentNode = existingChild;
      } else {
        var newChild = { title: headers[j], value: col, children: [] };
        currentNode.children.push(newChild);
        currentNode = newChild;
      }
    }
  }
  return root.children;
}



document.querySelector('#buildTreeBtn').addEventListener('click', function () {
  var csv = document.querySelector('#csvInput').value;
  var data = csvToTree(csv);
  document.querySelector('#tree').innerHTML = '';
  buildTree(data);
});
