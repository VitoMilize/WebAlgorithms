let aStarButton;
let antButton;
let geneticButton;
let treeButton;
let clusterButton;
let neuralButton;
initAStarButton();
initAntButton();
initGeneticButton();
initTreeButton();
initClusterButton();
initNeuralButton();

function initAStarButton() {
    aStarButton = document.getElementById("a star algo");
    aStarButton.addEventListener("click", function() {
        window.location.href = "algorithms/A Star";
    });
}

function initAntButton() {
    antButton = document.getElementById("ant algo");
    antButton.addEventListener("click", function() {
        window.location.href = "algorithms/Ant algorithm";
    });
}

function initGeneticButton() {
    geneticButton = document.getElementById("genetic algo");
    geneticButton.addEventListener("click", function() {
        window.location.href = "algorithms/Genetic algorithm";
    });
}

function initTreeButton() {
    treeButton = document.getElementById("tree algo");
    treeButton.addEventListener("click", function() {
        window.location.href = "algorithms/Decision Tree";
    });
}

function initClusterButton() {
    clusterButton = document.getElementById("cluster algo");
    clusterButton.addEventListener("click", function() {
        window.location.href = "algorithms/Clustering algorithm";
    });
}

function initNeuralButton() {
    neuralButton = document.getElementById("neural algo");
    neuralButton.addEventListener("click", function() {
        window.location.href = "algorithms/Neural network";
    });
}