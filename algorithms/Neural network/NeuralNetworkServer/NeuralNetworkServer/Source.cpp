#include <iostream>
#include <vector>
#include <Eigen/Dense>
#include <fstream>
#include <math.h>
#include <filesystem>
#include <rapidcsv.h>
#include"Functions.h"
#include <omp.h>
using namespace std;
using Eigen::MatrixXd;

int inputSize = 28 * 28;
vector<int> layers = { inputSize, 32, 16, 10 };
vector<MatrixXd> weightMatrixes(layers.size());
vector<MatrixXd> neuronInputs(layers.size());
vector<MatrixXd> neuronOutputs(layers.size());
vector<MatrixXd> neuronErrors(layers.size());
vector<MatrixXd> neuronErrorsMultWeights(layers.size());

double sigmoid(double x)
{
	return 1 / (1 + exp(-x));
}

double sigmoidD(double x)
{
	return sigmoid(x) * (1 - sigmoid(x));
}

void applyFunctionToMatrix(MatrixXd& m, double func(double x))
{
	for (int i = 0; i < m.rows(); i++)
	{
		for (int j = 0; j < m.cols(); j++)
		{
			m(i, j) = func(m(i, j));
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

void saveWeights(vector<MatrixXd>& weightMatrixes)
{
	int lastWeights = 0;
	filesystem::path pathToWeightsDir = ".//weights";
	for (const auto& entry : filesystem::directory_iterator(pathToWeightsDir)) {
		if (entry.is_directory()) {
			lastWeights = stoi(entry.path().filename().string());
		}
	}
	filesystem::path pathToLastWeightsDir = pathToWeightsDir.string() + "//" + to_string(lastWeights) + "//";
}

void directPassage(MatrixXd inputMatrix)
{
	neuronOutputs[0] = inputMatrix;
	for (int i = 1; i < layers.size(); i++)
	{
		//cout << "neuronOutputs" << i - 1 << ":" << endl << neuronOutputs[i - 1] << endl << endl;
		neuronInputs[i] = weightMatrixes[i] * neuronOutputs[i - 1];
		//cout << "weights" << i - 1 << "-" << i << ":" << endl << weightMatrixes[i] << endl << endl;
		//cout << "neuronSums" << i << ":" << endl << neuronSums[i] << endl << endl;
		neuronOutputs[i] = neuronInputs[i];
		applyFunctionToMatrix(neuronOutputs[i], sigmoid);
	}
}

void lern(MatrixXd inputMatrix, MatrixXd rightAnswers)
{
	for (int i = layers.size() - 1; i > 0; i--)
	{
		//cout << "layer: " << i << endl;
		//cout << weightMatrixes[i] << endl << endl;
		MatrixXd oldWeights = weightMatrixes[i];
#pragma omp parallel for
		for (int j = 0; j < neuronOutputs[i].size(); j++)
		{
			//cout << "\tneuron: " << j << endl;
			double error;
			if (i == layers.size() - 1)
			{
				error = -2 * (neuronOutputs[i](j, 0) - rightAnswers(j, 0)) * sigmoidD(neuronInputs[i](j, 0));
				//error = -2 * (neuronOutputs[i](j, 0) - rightAnswers(j, 0)) * sigmoidD(neuronSums[i](j, 0));
				/*cout << "\t\t neuron output: " << neuronOutputs[i](j, 0) << endl;
				cout << "\t\t right answer: " << rightAnswers(j, 0) << endl;
				cout << "\t\t neuron input: " << neuronInputs[i](j, 0) << endl;
				cout << "\t\t sigmoidD: " << sigmoidD(neuronInputs[i](j, 0)) << endl;
				cout << "\t\t error: " << error << endl;*/
			}
			else
			{
				error = neuronErrorsMultWeights[i + 1](j, 0) * sigmoidD(neuronInputs[i](j, 0));
				/*cout << "\t\t neuron output: " << neuronOutputs[i](j, 0) << endl;
				cout << "\t\t neuron errors mult weights: " << neuronErrorsMultWeights[i + 1](j, 0) << endl;
				cout << "\t\t neuron input: " << neuronInputs[i](j, 0) << endl;
				cout << "\t\t sigmoidD: " << sigmoidD(neuronInputs[i](j, 0)) << endl;
				cout << "\t\t error: " << error << endl;*/
			}
			neuronErrors[i](j, 0) = error;
			for (int w = 0; w < weightMatrixes[i].cols(); w++)
			{
				//cout << "\t\t pre neuron output" << w << ": " << neuronOutputs[i - 1](w, 0);
				double Dw = error * neuronOutputs[i - 1](w, 0);
				//cout << "\t\t Dw" << w << ": " << Dw << endl;
				weightMatrixes[i](j, w) += Dw;
			}
		}
		//cout << neuronErrors[i] << endl << endl;
		//cout << oldWeights.transpose() << endl << endl;
		//cout << neuronErrorsMultWeights[i] << endl << endl;

		//neuronErrorsMultWeights[i] = weightMatrixes[i].transpose() * neuronErrors[i];
		neuronErrorsMultWeights[i] = oldWeights.transpose() * neuronErrors[i];

		//cout << weightMatrixes[i] << endl << endl;
	}
	directPassage(inputMatrix);
}

void readDataset(rapidcsv::Document& doc, MatrixXd& inputMatrix, MatrixXd& rightAnswers)
{

}

int main()
{
	rapidcsv::Document doc("./dataset//mnist_train.csv");
	for (int f = 0; f < 50; f++)
	{
		vector<double> row = doc.GetRow<double>(f);
		cout << row[0] << endl;
		for (int i = 1; i < row.size(); i++)
		{
			if (row[i] != 0)
			{
				cout << "1 ";
			}
			else
			{
				cout << "0 ";
			}
			if ((i) % 28 == 0)
			{
				cout << endl;
			}
		}
		cout << endl;
	}
	

	//createNewWeights(layers);

	//readWeights(weightMatrixes);

	//

	//MatrixXd inputMatrix(inputSize, 1);
	//for (int i = 0; i < inputSize; i++)
	//{
	//	inputMatrix(i, 0) = 1;
	//}

	//MatrixXd rightAnswers(layers[layers.size() - 1], 1);
	//for (int i = 0; i < rightAnswers.size(); i++)
	//{
	//	rightAnswers(i, 0) = 1;
	//}

	//directPassage(inputMatrix);

	//for (int i = 0; i < layers.size(); i++)
	//{
	//	neuronErrors[i] = MatrixXd::Ones(layers[i], 1);
	//}


	//for (int k = 0; k < 1000000; k++)
	//{
	//	lern(inputMatrix, rightAnswers);
	//	if (k % 10000 == 0)
	//		cout << neuronOutputs[neuronOutputs.size() - 1] << endl << endl;
	//}

	std::system("pause");
}