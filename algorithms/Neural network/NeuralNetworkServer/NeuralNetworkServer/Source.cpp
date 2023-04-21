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
#include <nlohmann/json.hpp>
using namespace std;
using Eigen::MatrixXd;
using json = nlohmann::json;

volatile sig_atomic_t endSignal;

int inputSize = 20*20;
vector<int> layers = { inputSize, 512, 128, 10 };
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
		neuronInputs[i] = weightMatrixes[i] * neuronOutputs[i - 1];
		neuronOutputs[i] = neuronInputs[i];
		applyFunctionToMatrix(neuronOutputs[i], sigmoid);
	}
}

double lerningRate = 0.001;

void train(MatrixXd inputMatrix, MatrixXd rightAnswers)
{
	directPassage(inputMatrix);

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
				error = (neuronOutputs[i](j, 0) - rightAnswers(j, 0)) * sigmoidD(neuronInputs[i](j, 0));
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
				weightMatrixes[i](j, w) -= Dw;
			}
		}
		//cout << neuronErrors[i] << endl << endl;
		//cout << oldWeights.transpose() << endl << endl;
		//cout << neuronErrorsMultWeights[i] << endl << endl;

		//neuronErrorsMultWeights[i] = weightMatrixes[i].transpose() * neuronErrors[i];
		neuronErrorsMultWeights[i] = oldWeights.transpose() * neuronErrors[i]; // ���� �� ���������� �����???

		//cout << weightMatrixes[i] << endl << endl;
	}
}

void readDataset(rapidcsv::Document& doc, MatrixXd& inputMatrix, MatrixXd& rightAnswers, int i)
{
	vector<double> row = doc.GetRow<double>(i);
	int number = row[0];
	row.erase(row.begin());
	int width = 28, height = 28;

	for (int i = 0; i < height; i++)
	{
		double stringSum = 0;
		for (int j = 0; j < width; j++)
		{
			stringSum += row[i * width + j];
		}
		if (stringSum == 0)
		{
			for (int j = 0; j < width; j++)
			{
				row.erase(row.begin() + (i * width));
			}
			i--;
			height--;
		}
	}

	for (int i = 0; i < width; i++)
	{
		double colSum = 0;
		for (int j = 0; j < height; j++)
		{
			colSum += row[j * width + i];
		}
		if (colSum == 0)
		{
			for (int j = 0; j < height; j++)
			{
				row.erase(row.begin() + (j * width + i - j));
			}
			i--;
			width--;
		}
	}
	//cout << endl << width << " " << height << endl;

	int addRows = 20 - height;
	int addCols = 20 - width;
	int addRowsDown = addRows / 2;
	int addRowsUp = addRows - addRowsDown;
	int addColsRight = addCols / 2;
	int addColsLeft = addCols - addColsRight;


	for (int i = 0; i < addRowsDown * width; i++)
	{
		row.push_back(0);
	}
	height += addRowsDown;

	for (int i = 0; i < addRowsUp * width; i++)
	{
		row.insert(row.begin(), 0);
	}
	height += addRowsUp;

	for (int i = height - 1; i >= 0; i--)
	{
		for (int j = 0; j < addColsRight; j++)
		{
			row.insert(row.begin() + (i * width + width), 0);
		}
		for (int j = 0; j < addColsLeft; j++)
		{
			row.insert(row.begin() + (i * width), 0);
		}
	}

	width += addCols;

	/*for (int i = 0; i < height; i++)
	{
		for (int j = 0; j < width; j++)
		{
			cout << row[i * width + j] << " ";
		}
		cout << endl;
	}

	cout << endl << width << " " <<  height<< endl;*/

	for (int j = 0; j < rightAnswers.rows(); j++)
	{
		rightAnswers(j, 0) = 0;
		if (j == number)
		{
			rightAnswers(j, 0) = 1;
		}
	}
	for (int j = 0; j < row.size(); j++)
	{
		inputMatrix(j, 0) = row[j];
	}
}

void testModel(rapidcsv::Document& doc)
{
	MatrixXd inputMatrix(inputSize, 1);
	MatrixXd rightAnswers(layers[layers.size() - 1], 1);

	vector<double>numberAccuracy(10);
	vector<double>allNumber(10);

	double totalAccuracy = 0;
	double totalNumbers = 0;

	for (int i = 0; i < doc.GetRowCount(); i++)
	{
		readDataset(doc, inputMatrix, rightAnswers, i);
		directPassage(inputMatrix);

		int rightNumber;
		for (int j = 0; j < rightAnswers.rows(); j++)
		{
			if (rightAnswers(j, 0) == 1)
			{
				rightNumber = j;
				break;
			}
		}
		allNumber[rightNumber]++;
		totalNumbers++;

		double maxAns = 0;
		int numberAns;
		for (int j = 0; j < neuronOutputs[neuronOutputs.size() - 1].rows(); j++)
		{
			if (neuronOutputs[neuronOutputs.size() - 1](j, 0) > maxAns)
			{
				maxAns = neuronOutputs[neuronOutputs.size() - 1](j, 0);
				numberAns = j;
			}
		}
		
		if (numberAns == rightNumber)
		{
			numberAccuracy[rightNumber]++;
			totalAccuracy++;
		}
	}

	for (int i = 0; i < numberAccuracy.size(); i++)
	{
		numberAccuracy[i] /= allNumber[i];
	}
	cout << "\tAccuracy: " << endl;
	for (int i = 0; i < numberAccuracy.size(); i++)
	{
		cout << "\t" << i << ": " << numberAccuracy[i] << endl;
	}
	cout << "\ttotal: " << totalAccuracy / totalNumbers << endl;
	cout << endl;
}

void convertWeightsToJson()
{
	for (int k = 1; k < weightMatrixes.size(); k++)
	{
		json js;
		js = json::array();

		for (int i = 0; i < weightMatrixes[k].rows(); i++)
		{
			js[i] = json::array();

			for (int j = 0; j < weightMatrixes[k].cols(); j++)
			{
				js[i].push_back(weightMatrixes[k](i, j));
			}
		}

		std::ofstream outfile("../../weights/" + to_string(k-1) + "-" + to_string(k) + ".json");
		outfile << js;
		outfile.close();
	}
}

int main()
{
	signal(SIGINT, signalHendler);

	rapidcsv::Document trainDoc("./dataset//mnist_train.csv");
	rapidcsv::Document testDoc("./dataset//mnist_test.csv");
	MatrixXd inputMatrix(inputSize, 1);
	MatrixXd rightAnswers(layers[layers.size() - 1], 1);
	readDataset(trainDoc, inputMatrix, rightAnswers, 2);

	//createNewWeights(layers);

	readWeights(weightMatrixes);
	convertWeightsToJson();


	directPassage(inputMatrix);

	for (int i = 0; i < layers.size(); i++)
	{
		neuronErrors[i] = MatrixXd::Ones(layers[i], 1);
	}

	size_t k = 0;
	while (endSignal == 1)
	{
		cout << "epoch: " << k << endl;

		testModel(testDoc);

		for (int i = 0; i < trainDoc.GetRowCount() && endSignal == 0; i++)
		{
			readDataset(trainDoc, inputMatrix, rightAnswers, i);
			
			train(inputMatrix, rightAnswers);
			if (i % 10000 == 0)
			{
				saveWeights(weightMatrixes);
			}
		}
		k++;
	}

	std::system("pause");
}