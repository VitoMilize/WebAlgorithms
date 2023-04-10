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
    ul.appendChild(li);
    if (item.children && item.children.length) {
      buildTree(item.children, li);
    }
  });
}

function csvToTree(csv) {
  csv = 'csv,' + csv;//тут тотальный колхоз
  var lines = csv.split("\n");
  var headers = lines[0].split(",").map(function (header) { return header.trim(); });
  var root = { title: headers[0], children: [] };
  for (var i = 1; i < lines.length; i++) {
    var cols = lines[i].split(",");
    var currentNode = root;
    for (var j = 0; j < cols.length; j++) {
      var col = cols[j];
      var existingChild = currentNode.children.find(function (child) {
        return child.title === headers[j + 1] && child.value === col;
      });
      if (existingChild) {
        currentNode = existingChild;
      } else {
        var newChild = { title: headers[j + 1], value: col, children: [] };
        currentNode.children.push(newChild);
        currentNode = newChild;
      }
    }
  }
  return root.children;
}

function findPathByValue(tree, value, highlight) {
  var path = [];
  function search(node) {
    console.log(node.value);
    if (node.value === value) {
      path.push(node);
      return true;
    } else if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        if (search(node.children[i])) {
          path.push(node);
          return true;
        }
      }
    }
    return false;
  }
  if (highlight) {
    removeHighlights(tree);
  }
  if (search(tree)) {
    path.reverse();
    return path;
  } else {
    return null;
  }
}


function removeHighlights(tree) {
  function traverse(node) {
    if (node.highlighted) {
      node.highlighted = false;
      var li = document.querySelector('li[data-path="' + node.path.join('-') + '"]');
      if (li) {
        li.classList.remove('highlighted');
      }
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        traverse(node.children[i]);
      }
    }
  }
  traverse(tree);
}


document.querySelector('#buildTreeBtn').addEventListener('click', function () {
  var csv = document.querySelector('#csvInput').value;
  var data = csvToTree(csv);
  document.querySelector('#tree').innerHTML = '';
  buildTree(data);
});

document.querySelector('#searchBtn').addEventListener('click', function () {
  var searchValue = document.querySelector('#searchInput').value;
  var data = document.querySelector('#csvInput').value;
  var tree = csvToTree(data);
  console.log(searchValue);
  var path = findPathByValue(tree, searchValue, true);
  if (path) {
    highlightPath(path);
  } else {
    alert('Element not found');
  }
});

