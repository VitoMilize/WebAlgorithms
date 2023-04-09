let map;
let context;
let button;
let points = [];
let adjacencyMatrix = [];
let amountOfCity;
let populationSize;
let inputPopulationSize;
let mutationRate;
let inputMutationRate;
let amountOfGenerations;
let inputAmountOfGenerations;
initMap();
initButtonStart();
initInputPopulationSize();
initInputMutationRate();
initInputAmountOfGenerations();

function initMap() {
    map = document.getElementById("map");
    map.width = map.offsetWidth;
    map.height = map.offsetHeight;
    context = map.getContext("2d");
    map.addEventListener("click", handleClick);
}

function initInputAmountOfGenerations() {
    inputAmountOfGenerations = document.getElementById("inputAmountOfGenerations");
}

function initInputPopulationSize() {
    inputPopulationSize = document.getElementById("inputPopulationSize");
}

function initInputMutationRate() {
    inputMutationRate = document.getElementById("inputMutationRate");
}

function handleClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    points.push({ x, y });
    console.log(x, y);

    context.clearRect(0, 0, map.width, map.height);
    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i].x, points[i].y, 2, 0, 2 * Math.PI);
        context.fill();
    }
}

function initButtonStart() {
    button = document.getElementById("buttonStart");
    button.width = button.offsetWidth;
    button.height = button.offsetHeight;
    button.textContent = "Запуск";
    button.addEventListener("click", resultClick);
}
function resultClick() {
    amountOfCity = points.length;
    amountOfGenerations = inputAmountOfGenerations.value === "" ? 500 : inputAmountOfGenerations.value;
    populationSize = inputPopulationSize.value === "" ? 10 : inputPopulationSize.value;
    mutationRate = inputMutationRate.value === "" ? 10 : inputMutationRate.value;
    adjacencyMatrix = createAdjacencyMatrix();
    TSPUtil();
}

function getDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x)**2 + (point1.y - point2.y)**2);
}

function createAdjacencyMatrix() {
    const matrix = new Array(points.length);

    for (let i = 0; i < points.length; i++) {
        matrix[i] = new Array(points.length);
        for (let j = 0; j < points.length; j++)
            matrix[i][j] = i === j ? 0 : getDistance(points[i], points[j]);
    }

    return matrix;
}

class individual {
    gnome = [];
    fitness;
    constructor(gnome, fitness) {
        this.gnome = gnome;
        this.fitness = fitness;
    }
}

function randNum(start, end) {
    return start + Math.floor(Math.random() * (end - start));
}

function createGnome() {
    let gnome = [0];
    while (true) {
        if (gnome.length === amountOfCity) {
            gnome.push(0);
            break;
        }
        let temp = randNum(1, amountOfCity);
        if (!gnome.includes(temp))
            gnome.push(temp);
    }
    return gnome;
}

function calFitness(gnome) {
    let fitness = 0;
    for (let i = 0; i < gnome.length - 1; i++)
        fitness += adjacencyMatrix[gnome[i]][gnome[i + 1]];
    return fitness;
}

function findBestPath(population, bestPath) {
    for (let i = 0; i < populationSize; i++)
        if (population[i].fitness < bestPath.fitness)
            bestPath = population[i];
    return bestPath
}

function drawPath(gnome) {
    context.clearRect(0, 0, map.width, map.height);
    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i].x, points[i].y, 2, 0, 2 * Math.PI);
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

function randomWithProbability(probability) {
    const randomNum = Math.floor(Math.random() * 101);
    return randomNum <= probability;
}

function crossover(parent1, parent2) {
    const breakpoint = Math.floor(Math.random() * (amountOfCity));

    const childGnome = [];

    for (let i = 0; i < breakpoint; i++) {
        childGnome.push(parent1.gnome[i]);
    }

    for (let i = 0; i < amountOfCity; i++) {
        const gene = parent2.gnome[i];
        if (!childGnome.includes(gene))
            childGnome.push(gene);
    }
    childGnome.push(0);

    return new individual(childGnome, calFitness(childGnome));
}

function crossoverPopulation(population) {
    const offspring = [];

    while (offspring.length < populationSize) {
        const parent1 = population[Math.floor(Math.random() * population.length)];
        const parent2 = population[Math.floor(Math.random() * population.length)];

        const child = crossover(parent1, parent2);

        offspring.push(child);
    }
    return offspring;
}

function mutatedGene(gnome) {
    const newGnome = [...gnome];
    while (true) {
        const gene1 = randNum(1, amountOfCity - 1);
        const gene2 = randNum(1, amountOfCity - 1);
        if (gene1 !== gene2) {
            const temp = newGnome[gene1];
            newGnome[gene1] = newGnome[gene2];
            newGnome[gene2] = temp;
            break;
        }
    }

    return new individual(newGnome, calFitness(newGnome));
}

function mutatePopulation(population) {
    const mutatedPopulation = population;
    for (let i = 0; i < populationSize; i++)
        if (randomWithProbability(mutationRate))
            mutatedPopulation[i] = mutatedGene(population[i].gnome);

    return mutatedPopulation;
}


function TSPUtil() {
    let generation = 1;

    let population = [];

    for (let i = 0; i < populationSize; i++) {
        let temp = new individual();
        temp.gnome = createGnome();
        temp.fitness = calFitness(temp.gnome);
        population.push(temp);
    }

    let bestPath = new individual(null, Infinity)
    bestPath = findBestPath(population, bestPath);
    console.log(bestPath.gnome + " " + bestPath.fitness);
    drawPath(bestPath.gnome);

    while (generation <= amountOfGenerations) {
        let new_population = crossoverPopulation(population);
        new_population = mutatePopulation(new_population);

        population = new_population;
        let bestPathInPopulation = findBestPath(population, bestPath);
        if (bestPath !== bestPathInPopulation) {
            bestPath = bestPathInPopulation;
            drawPath(bestPath.gnome);
        }
        console.log(bestPath.gnome + " " + bestPath.fitness);

        generation++;
    }
}



