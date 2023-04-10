let csvData;

function loadData() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                csvData = xhr.responseText;
                resolve();
            }
        };
        xhr.open('GET', './mnist_test.csv');
        xhr.send();
    });
}

loadData()
    .then(() => {
        lern();
    })
    .catch((error) => {
        console.error('Ошибка загрузки данных:', error);
    });

function lern() {
    const rows = csvData.split('\n');
    console.log(rows[1]);
}