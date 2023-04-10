let dataset;

function loadDataset() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                dataset = xhr.responseText;
                resolve();
            }
        };
        xhr.open('GET', './mnist_test.csv');
        xhr.send();
    });
}

loadDataset()
    .then(() => {
        lern();
    })
    .catch((error) => {
        console.error('Ошибка загрузки данных:', error);
    });

function lern() {
    const rows = dataset.split('\n');
    console.log(rows[1]);
}