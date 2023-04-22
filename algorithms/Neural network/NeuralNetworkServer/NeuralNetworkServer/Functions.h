#pragma once
#include <Eigen/Dense>
#include <fstream>
using namespace std;

using Eigen::MatrixXd;

void saveMatrix(MatrixXd m, string path)
{
	int rows = m.rows(), cols = m.cols();
	ofstream ofs(path, ios::out | ios::binary);
	ofs.write((char*)&rows, sizeof(int));
	ofs.write((char*)&cols, sizeof(int));
	ofs.write((char*)m.data(), m.size() * sizeof(double));
	ofs.close();
}

MatrixXd readMatrix(string path)
{
	int rows, cols;
	ifstream ifs(path, ios::binary);
	if (ifs.fail())
	{
		cout << "weights not found" << endl;
		return MatrixXd();
	}
	ifs.read((char*)&rows, sizeof(int));
	ifs.read((char*)&cols, sizeof(int));
	MatrixXd m(rows, cols);
	ifs.read((char*)m.data(), m.size() * sizeof(double));
	ifs.close();
	return m;
}