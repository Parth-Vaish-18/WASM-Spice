# WASM-Spice: Real-Time MNA Circuit Simulator

**Desktop-grade analog circuit simulation, brought natively to the browser.**

WASM-Spice is a high-performance, browser-based circuit simulator. By combining a highly optimized C++ mathematical engine with a modern React frontend via WebAssembly (WASM), it performs real-time **Modified Nodal Analysis (MNA)** directly on the client side with zero backend server lag.

## ⚡ The Core Experience

* **Deterministic Physics Engine:** At the heart of WASM-Spice is a custom-built C++ solver. Instead of relying on slow JavaScript math libraries, it executes pure native matrix algebra to calculate node voltages at 500+ iterations per second.
* **Interactive Canvas:** A highly responsive, node-based UI powered by React Flow. Users can drag, drop, and wire components naturally, creating complex schematics in seconds.
* **Dynamic Oscilloscope:** Live-updating voltage trace graphs with automatic scaling and Net labeling. 
    * *Intentional Design (Performance):* The oscilloscope is decoupled from the main React render cycle to ensure traces update smoothly at 60 FPS without choking the browser or causing input lag when interacting with the canvas.
* **Dependent Sources Support:** Full mathematical implementation of Voltage-Controlled Voltage Sources (VCVS) and Voltage-Controlled Current Sources (VCCS), allowing for the simulation of complex active components like operational amplifiers.

## 🛡️ Robust Error Interception

Simulating circuits dynamically means users will inevitably build invalid schematics. WASM-Spice is built to handle this gracefully:
* **Singular Matrix Defense:** If a user builds an invalid circuit (e.g., a floating ground, parallel voltage sources, or a direct short circuit), the underlying MNA matrix becomes singular (non-invertible). 
* **Safe Failsafes:** Instead of crashing the browser tab or throwing an unhandled WASM memory exception, the C++ engine safely catches the math failure mid-calculation. It halts the solver and passes a sanitized error code back through the WASM bridge, triggering a user-friendly UI alert explaining the exact issue.

## 🏗️ Architecture & WebAssembly Bridge

WASM-Spice is architected to separate heavy computation from the visual layer:

* **The React Frontend (`UI & State`):** Acts as the schematic compiler. As the user draws wires, the frontend dynamically generates a "netlist" (a data structure of components and their node connections).
* **The Emscripten Bridge (`WASM`):** The crucial middle layer. It passes the serialized netlist from JavaScript memory space into C++ memory space with near-zero overhead.
* **The C++ Engine (`Math Core`):** 1. Parses the netlist.
    2. Constructs the `G` (conductance), `B`, `C`, and `D` matrices based on Kirchhoff's Current and Voltage Laws.
    3. Solves the linear system `Ax = z` using optimized numerical methods.
    4. Streams the resulting voltage array back to the frontend for the oscilloscope to render.

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, React Flow, Vite
* **Math Engine:** Modern C++17 (Matrix Algebra, Numerical Methods)
* **Compiler/Bridge:** WebAssembly (WASM), Emscripten Toolkit

## 📁 Project Structure

```text
├── public/       # Pre-compiled WebAssembly (.wasm) and Emscripten bridge
├── src/          # React frontend, UI components, and React Flow logic
│   └── engine/   # C++ source code and custom MNA matrix solver
└── package.json  # Node dependencies and build scripts
```

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
*(Note: You do not need to install C++ or Emscripten to run the app, as the pre-compiled solver.js and .wasm files are already securely bundled in the public folder).*
