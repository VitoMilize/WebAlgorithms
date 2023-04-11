#include <iostream>
#include <vector>
#include <Eigen/Dense>
#include <fstream>
#include <math.h>
#include <filesystem>
#include"Functions.h"
using namespace std;
using Eigen::MatrixXd;

double activationFunction(double x)
{
	return 1 / (1 + exp(-x));
}

void applyFunction(MatrixXd& m)
{
	for (int i = 0; i < m.rows(); i++)
	{
		for (int j = 0; j < m.cols(); j++)
		{
			m(i, j) = activationFunction(m(i, j));
		}
	}
}

void createNewWeights(vector<int> layers)
{
	int lastWeights = 0;
	filesystem::path pathToWeightsDir = ".//weights";
	for (const auto& entry : filesystem::directory_iterator(pathToWeightsDir)) {
		if (entry.is_directory()) {
			lastWeights = stoi(entry.path().filename().string());
		}
	}
	filesystem::path pathToNewWeightsDir = pathToWeightsDir.string() + "//" + to_string(lastWeights + 1) + "//";

	filesystem::create_directory(pathToNewWeightsDir);
	for (int i = 1; i < layers.size(); i++)
	{
		MatrixXd m = MatrixXd::Random(layers[i], layers[i - 1]);
		saveMatrix(m, pathToNewWeightsDir.string() + to_string(i - 1) + "-" + to_string(i) + ".bin");
	}
}

void readWeights(vector<MatrixXd>& weightMatrixes)
{
	int lastWeights = 0;
	filesystem::path pathToWeightsDir = ".//weights";
	for (const auto& entry : filesystem::directory_iterator(pathToWeightsDir)) {
		if (entry.is_directory()) {
			lastWeights = stoi(entry.path().filename().string());
		}
	}

	if (lastWeights == 0)
	{
		cout << "weights not found" << endl;
		return;
	}

	filesystem::path pathToLastWeightsDir = pathToWeightsDir.string() + "//" + to_string(lastWeights) + "//";

	for (int i = 1; i < weightMatrixes.size(); i++)
	{
		weightMatrixes[i] = readMatrix(pathToLastWeightsDir.string() + to_string(i - 1) + "-" + to_string(i) + ".bin");
	}
}

int main()
{		
	int inputSize = 50;
	vector<int> layers = { inputSize, 32, 16, 10 };
	vector<MatrixXd> weightMatrixes(layers.size());

	//createNewWeights(layers);

	readWeights(weightMatrixes);

	MatrixXd inputMatrix(inputSize, 1);
	for (int i = 0; i < inputSize; i++)
	{
		inputMatrix(i, 0) = 1;
	}

	MatrixXd currentMatrix = inputMatrix;
	for (int i = 1; i < layers.size(); i++)
	{
		currentMatrix = weightMatrixes[i] * currentMatrix;
		applyFunction(currentMatrix);
		cout << currentMatrix << endl << endl;
	}

	system("pause");
}