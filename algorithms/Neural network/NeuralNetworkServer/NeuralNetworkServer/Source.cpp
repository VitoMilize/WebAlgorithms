#include <iostream>
#include <vector>
#include <Eigen/Dense>
#include <fstream>
#include <math.h>
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
	for (int i = 1; i < layers.size(); i++)
	{
		MatrixXd m = MatrixXd::Random(layers[i], layers[i - 1]);
		saveMatrix(m, "weights1\\matrix" + to_string(i-1) + "-" + to_string(i) + ".bin");
	}
}

void readWeights(vector<MatrixXd>& weightMatrixes)
{
	for (int i = 1; i < weightMatrixes.size(); i++)
	{
		weightMatrixes[i] = readMatrix("weights\\matrix" + to_string(i - 1) + "-" + to_string(i) + ".bin");
	}
}

int main()
{
	//std::filesystem::path path_to_dir = "."; // путь до каталога
	//for (const auto& entry : std::filesystem::directory_iterator(path_to_dir)) {
	//	if (entry.is_directory()) {
	//		std::cout << entry.path() << std::endl;
	//	}
	//}
		
	/*int inputSize = 50;
	vector<int> layers = { inputSize, 32, 16, 10 };
	vector<MatrixXd> weightMatrixes(layers.size());

	createNewWeights(layers);

	readWeights(weightMatrixes);

	MatrixXd inputMatrix(inputSize, 1);
	for (int i = 0; i < inputSize; i++)
	{
		inputMatrix(i, 0) = i;
	}

	MatrixXd currentMatrix = inputMatrix;
	for (int i = 1; i < layers.size(); i++)
	{
		currentMatrix = weightMatrixes[i] * currentMatrix;
		applyFunction(currentMatrix);
		cout << currentMatrix << endl << endl;
	}*/

	system("pause");
}