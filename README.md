# WASM-Spice: Real-Time MNA Circuit Simulator

A high-performance, browser-based analog circuit simulator. This project combines a highly optimized C++ mathematical engine with a modern React frontend, compiled together using WebAssembly (WASM). 

It performs real-time **Modified Nodal Analysis (MNA)** to solve complex circuits directly in the browser with zero backend server lag.

## ✨ Features
* **Real-Time Physics Engine:** Solves MNA matrices at 500+ iterations per second using a custom C++ solver.
* **Interactive Canvas:** Drag-and-drop React Flow interface for wiring components.
* **Dynamic Oscilloscope:** Live-updating voltage trace graphs with automatic scaling and Net labeling.
* **Dependent Sources:** Full mathematical support for Voltage-Controlled Voltage Sources (VCVS) and Voltage-Controlled Current Sources (VCCS).
* **Robust Error Handling:** Safely intercepts and explains singular matrix errors (e.g., floating grounds or short circuits).
* **Save/Load:** Import and export your schematics as `.json` files.

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, React Flow
* **Math Engine:** C++17
* **Bridge:** WebAssembly (WASM), Emscripten

## 🚀 How to Run Locally
If you want to run this simulator on your own machine, open your terminal (or the VS Code terminal) and run the following commands:

1. Clone this repository:
   ```bash
   git clone https://github.com/Parth-Vaish-18/wasm-spice.git
   ```

2. Navigate to the project folder and install dependencies:
   ```bash
   cd wasm-spice
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser. 
*(Note: You do not need to install C++ or Emscripten to run the app, as the pre-compiled solver.js and .wasm files are already included in the public folder).*
