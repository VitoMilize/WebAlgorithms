#include <iostream>
#include <vector>
#include <Eigen/Dense>
#include <fstream>
using namespace std;
using namespace Eigen;



int main()
{
	MatrixXd m(2, 10);
	m << 1, 2, 3, 4, 5, 6, 7, 8, 9, 10;
	std::cout << m << std::endl;

	cout << endl << m.size();
	
	//return 0;
	//std::ofstream file("matrix.bin", std::ios::out | std::ios::binary);
	//file.write((char*)m.data(), m.size() * sizeof(double));
	//file.close();

	//MatrixXd n(2, 2);
	//std::ifstream infile("matrix.bin", std::ios::binary);
	//infile.read((char*)n.data(), n.size() * sizeof(double));
	//infile.close();

	//cout << endl;
	//cout << n;

	//std::system("pause");
}