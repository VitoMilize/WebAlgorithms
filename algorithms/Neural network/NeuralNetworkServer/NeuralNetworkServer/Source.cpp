#include <iostream>
#include <vector>
#include <Eigen/Dense>
#include <fstream>
#include <math.h>
#include <filesystem>
#include <rapidcsv.h>
#include <csignal>
#include"Functions.h"
#include <omp.h>
using namespace std;
using Eigen::MatrixXd;

volatile sig_atomic_t endSignal;

int inputSize = 28 * 28;
vector<int> layers = { inputSize, 256, 128, 10 };
vector<MatrixXd> weightMatrixes(layers.size());
vector<MatrixXd> neuronInputs(layers.size());
vector<MatrixXd> neuronOutputs(layers.size());
vector<MatrixXd> neuronErrors(layers.size());
vector<MatrixXd> neuronErrorsMultWeights(layers.size());

void signalHendler(int signal)
{
	endSignal = signal;
}

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
	for (int i = 1; i < weightMatrixes.size(); i++)
	{
		saveMatrix(weightMatrixes[i], pathToLastWeightsDir.string() + to_string(i - 1) + "-" + to_string(i) + ".bin");
	}
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

double lerningRate = 0.1;

void train(MatrixXd inputMatrix, MatrixXd rightAnswers)
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
				double Dw = error * neuronOutputs[i - 1](w, 0) * lerningRate;
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

void readDataset(rapidcsv::Document& doc, MatrixXd& inputMatrix, MatrixXd& rightAnswers, int i)
{
	vector<double> row = doc.GetRow<double>(i);
	for (int j = 0; j < rightAnswers.rows(); j++)
	{
		rightAnswers(j, 0) = 0;
		if (j == row[0])
		{
			rightAnswers(j, 0) = 1;
		}
	}
	for (int j = 1; j < row.size(); j++)
	{
		inputMatrix(j-1, 0) = row[j];
	}
}

int main()
{
	signal(SIGINT, signalHendler);

	rapidcsv::Document trainDoc("./dataset//mnist_train.csv");
	rapidcsv::Document testDoc("./dataset//mnist_test.csv");
	MatrixXd inputMatrix(inputSize, 1);
	MatrixXd rightAnswers(layers[layers.size() - 1], 1);
	readDataset(trainDoc, inputMatrix, rightAnswers, 0);

	//createNewWeights(layers);

	readWeights(weightMatrixes);

	directPassage(inputMatrix);

	for (int i = 0; i < layers.size(); i++)
	{
		neuronErrors[i] = MatrixXd::Ones(layers[i], 1);
	}

	int k = 1;
	while (endSignal == 0)
	{
		for (int i = 0; i < trainDoc.GetRowCount() && endSignal == 0; i++)
		{
			readDataset(trainDoc, inputMatrix, rightAnswers, 0);
			train(inputMatrix, rightAnswers);
			if (i % 10000 == 0)
			{
				saveWeights(weightMatrixes);
			}
		}
		readDataset(trainDoc, inputMatrix, rightAnswers, 0);
		directPassage(inputMatrix);
		/*cout << rightAnswers << endl << endl;
		cout << neuronOutputs[neuronOutputs.size() - 1];*/
		double error = 0;
		for (int i = 0; i < rightAnswers.rows(); i++)
		{
			error += abs(rightAnswers(i, 0) - neuronOutputs[neuronOutputs.size() - 1](i, 0));
		}
		cout << "epoch: " << k << "\t" << "error :" << error << endl;
		k++;
	}

	std::system("pause");
}