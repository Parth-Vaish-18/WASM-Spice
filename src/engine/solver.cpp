#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <cmath>
#include <emscripten/bind.h>
using namespace std;
using namespace emscripten;
struct Component { char type; int n1, n2, nc1, nc2; double value; };

class CircuitEngine {
public:
    CircuitEngine() { cout << "Ultimate SPICE Engine Online!" << endl; }
    string solveNetlist(string netlist) {
        vector<Component> components; stringstream ss(netlist); string line;
        int maxNode = 0; int numAuxRows = 0; double dt = 0.01; double tStop = 5.0;
        while (getline(ss, line)) {
            if (line.empty()) continue;
            stringstream ls(line); string name; ls >> name;
            if (name == ".TRAN") { ls >> dt >> tStop; continue; }

            char type = name[0];
            if (type == 'E' || type == 'G') {
                int n1, n2, nc1, nc2; double val; ls >> n1 >> n2 >> nc1 >> nc2 >> val;
                components.push_back({type, n1, n2, nc1, nc2, val});
                if (nc1 > maxNode) maxNode = nc1; if (nc2 > maxNode) maxNode = nc2;
                if (n1 > maxNode) maxNode = n1; if (n2 > maxNode) maxNode = n2;
                if (type == 'E') numAuxRows++; 
            }
            else {
                int n1, n2; double val; ls >> n1 >> n2 >> val;
                components.push_back({type, n1, n2, 0, 0, val});
                if (n1 > maxNode) maxNode = n1; if (n2 > maxNode) maxNode = n2;
                if (type == 'V' || type == 'L') numAuxRows++; 
            }
        }
        int N = maxNode; int size = N + numAuxRows; int numSteps = (int)(tStop / dt);
        vector<double> prevX(size, 0.0); vector<vector<double>> timeResults;

        for (int step = 0; step <= numSteps; step++) {
            vector<vector<double>> A(size, vector<double>(size, 0.0));
            vector<double> Z(size, 0.0); int auxIndex = 0;
            for (const auto& comp : components) {
                int n1 = comp.n1 - 1; int n2 = comp.n2 - 1;
                int nc1 = comp.nc1 - 1; int nc2 = comp.nc2 - 1;
                if (comp.type == 'R') {
                    double g = 1.0 / comp.value;
                    if (comp.n1 != 0) A[n1][n1] += g; if (comp.n2 != 0) A[n2][n2] += g;
                    if (comp.n1 != 0 && comp.n2 != 0) { A[n1][n2] -= g; A[n2][n1] -= g; }
                } 
                else if (comp.type == 'I') { // Independent Current Source
                    if (comp.n1 != 0) Z[n1] -= comp.value; // Current leaves N+
                    if (comp.n2 != 0) Z[n2] += comp.value; // Current enters N-
                }
                else if (comp.type == 'C') {
                    double g = comp.value / dt; 
                    if (comp.n1 != 0) A[n1][n1] += g; if (comp.n2 != 0) A[n2][n2] += g;
                    if (comp.n1 != 0 && comp.n2 != 0) { A[n1][n2] -= g; A[n2][n1] -= g; }
                    double prevV1 = (comp.n1 != 0) ? prevX[n1] : 0.0;
                    double prevV2 = (comp.n2 != 0) ? prevX[n2] : 0.0;
                    double histI = g * (prevV1 - prevV2);
                    if (comp.n1 != 0) Z[n1] += histI; if (comp.n2 != 0) Z[n2] -= histI;
                }
                else if (comp.type == 'G') { // VCCS
                    double gm = comp.value;
                    if (comp.n1 != 0 && comp.nc1 != 0) A[n1][nc1] += gm;
                    if (comp.n1 != 0 && comp.nc2 != 0) A[n1][nc2] -= gm;
                    if (comp.n2 != 0 && comp.nc1 != 0) A[n2][nc1] -= gm;
                    if (comp.n2 != 0 && comp.nc2 != 0) A[n2][nc2] += gm;
                }
                else if (comp.type == 'V' || comp.type == 'L' || comp.type == 'E') {
                    int row = N + auxIndex;
                    if (comp.n1 != 0) { A[n1][row] += 1.0; A[row][n1] += 1.0; }
                    if (comp.n2 != 0) { A[n2][row] -= 1.0; A[row][n2] -= 1.0; }
                    
                    if (comp.type == 'V') Z[row] = comp.value; 
                    else if (comp.type == 'L') {
                        double eqR = comp.value / dt; A[row][row] -= eqR;
                        Z[row] = -eqR * prevX[row]; 
                    } 
                    else if (comp.type == 'E') {
                        if (comp.nc1 != 0) A[row][nc1] -= comp.value;
                        if (comp.nc2 != 0) A[row][nc2] += comp.value;
                    }
                    auxIndex++;
                }
            }
            for (int i = 0; i < size; i++) {
                double maxEl = abs(A[i][i]); int maxRow = i;
                for (int k = i + 1; k < size; k++) if (abs(A[k][i]) > maxEl) { maxEl = abs(A[k][i]); maxRow = k; }
                if (maxEl < 1e-12) return "{\"error\": \"Singular Matrix!\"}";
                swap(A[i], A[maxRow]); swap(Z[i], Z[maxRow]);
                for (int k = i + 1; k < size; k++) {
                    double c = -A[k][i] / A[i][i];
                    for (int j = i; j < size; j++) { if (i == j) A[k][j] = 0; else A[k][j] += c * A[i][j]; }
                    Z[k] += c * Z[i];
                }
            }
            vector<double> X(size, 0.0);
            for (int i = size - 1; i >= 0; i--) {
                X[i] = Z[i];
                for (int j = i + 1; j < size; j++) X[i] -= A[i][j] * X[j];
                X[i] = X[i] / A[i][i];
            }
            prevX = X; timeResults.push_back(X);
        }
        stringstream json; json << "{\"status\":\"success\",\"time\":[";
        for(int s = 0; s <= numSteps; s++) json << (s * dt) << (s < numSteps ? "," : ""); 
        json << "],\"nodes\":{";
        for(int i = 0; i < N; i++) {
            json << "\"Net " << (i + 1) << "\":[";
            for(int s = 0; s <= numSteps; s++) json << timeResults[s][i] << (s < numSteps ? "," : "");
            json << "]" << (i < N - 1 ? "," : "");
        }
        json << "}}"; return json.str();
    }
};
EMSCRIPTEN_BINDINGS(circuit_module) { class_<CircuitEngine>("CircuitEngine").constructor<>().function("solveNetlist", &CircuitEngine::solveNetlist); }