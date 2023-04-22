let adjacencyMatrix = [];
let amountOfCity;
let populationSize = 2500;
let mutationRate = 75;

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
    let mutations = 0;
    while (mutations !== 250) {
        const gene1 = randNum(1, amountOfCity - 1);
        const gene2 = randNum(1, amountOfCity - 1);
        if (gene1 !== gene2) {
            const temp = newGnome[gene1];
            newGnome[gene1] = newGnome[gene2];
            newGnome[gene2] = temp;
            mutations++;
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

function delay(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
async function TSPUtil() {
    let population = [];

    amountOfCity = points.length;
    if (amountOfCity === 2)
        return;
    if (amountOfCity === 3) {
        drawPath([0, 1, 2, 0]);
        return;
    }

    adjacencyMatrix = createAdjacencyMatrix();

    for (let i = 0; i < populationSize; i++) {
        let temp = new individual();
        temp.gnome = createGnome();
        temp.fitness = calFitness(temp.gnome);
        population.push(temp);
    }

    let bestPath = new individual(null, Infinity)
    bestPath = findBestPath(population, bestPath);
    console.log(bestPath);
    drawPath(bestPath.gnome);

    let similarPathTimes = 0;
    while (similarPathTimes < 1500) {
        let new_population = crossoverPopulation(population);
        new_population = mutatePopulation(new_population);

        population = new_population;
        let bestPathInPopulation = findBestPath(population, bestPath);
        if (bestPath.fitness > bestPathInPopulation.fitness) {
            console.log('draw');
            bestPath = bestPathInPopulation;
            drawPath(bestPath.gnome);
            await delay(10);
            similarPathTimes = 0;
        }
        else
            similarPathTimes++;
    }
    alert("конец");
}