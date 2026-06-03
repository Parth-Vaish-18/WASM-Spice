import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { 
  ReactFlowProvider, useReactFlow, addEdge, Background, Controls, 
  applyNodeChanges, applyEdgeChanges, Handle, Position, ConnectionMode,
  type Node, type Edge, type Connection}
from 'reactflow';
import 'reactflow/dist/style.css';

// --- STYLES ---
const nodeStyle = { padding: '10px', borderRadius: '8px', background: '#fff', textAlign: 'center' as const, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' };
const inputStyle = { width: '50px', border: 'none', borderBottom: '2px solid #ddd', textAlign: 'center' as const, background: 'transparent', fontSize: '14px', fontWeight: 'bold', color: '#333', outline: 'none' };
const handleStyle = { width: '8px', height: '8px', background: '#555', border: '2px solid #fff' };

// --- CUSTOM NODES ---
const createInput = (data: any, width: string) => (
  <input className="nodrag" type="number" value={data.value} onChange={data.onChange} step="1" onKeyDown={(e) => e.stopPropagation()} style={{...inputStyle, width}} />
);
const ResistorNode = ({ data }: { data: any }) => (
  <div style={{ ...nodeStyle, border: '2px solid #7f8c8d' }}>
    <Handle type="source" position={Position.Left} id="plus" style={handleStyle} />
    <div style={{ fontSize: '12px', fontWeight: 600, color: '#7f8c8d', marginBottom: '4px', textTransform: 'uppercase' }}>Resistor</div>
    <div>{createInput(data, '50px')} <span style={{color: '#777'}}>Ω</span></div>
    <Handle type="source" position={Position.Right} id="minus" style={handleStyle} />
  </div>
);
const CapacitorNode = ({ data }: { data: any }) => (
  <div style={{ ...nodeStyle, border: '2px solid #3498db' }}>
    <Handle type="source" position={Position.Left} id="plus" style={{...handleStyle, background: '#3498db'}} />
    <div style={{ fontSize: '12px', fontWeight: 600, color: '#3498db', marginBottom: '4px', textTransform: 'uppercase' }}>Capacitor</div>
    <div>{createInput(data, '60px')} <span style={{color: '#777'}}>F</span></div>
    <Handle type="source" position={Position.Right} id="minus" style={{...handleStyle, background: '#3498db'}} />
  </div>
);
const InductorNode = ({ data }: { data: any }) => (
  <div style={{ ...nodeStyle, border: '2px solid #9b59b6' }}>
    <Handle type="source" position={Position.Left} id="plus" style={{...handleStyle, background: '#9b59b6'}} />
    <div style={{ fontSize: '12px', fontWeight: 600, color: '#9b59b6', marginBottom: '4px', textTransform: 'uppercase' }}>Inductor</div>
    <div>{createInput(data, '50px')} <span style={{color: '#777'}}>H</span></div>
    <Handle type="source" position={Position.Right} id="minus" style={{...handleStyle, background: '#9b59b6'}} />
  </div>
);
const VoltageNode = ({ data }: { data: any }) => (
  <div style={{ ...nodeStyle, border: '2px solid #e74c3c', borderRadius: '50%', width: '65px', height: '65px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Handle type="source" position={Position.Top} id="plus" style={{...handleStyle, background: '#e74c3c'}} />
    <div>{createInput(data, '45px')}</div><div style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 'bold' }}>V</div>
    <Handle type="source" position={Position.Bottom} id="minus" style={handleStyle} />
  </div>
);
const CurrentNode = ({ data }: { data: any }) => (
  <div style={{ ...nodeStyle, border: '2px solid #f1c40f', borderRadius: '50%', width: '65px', height: '65px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Handle type="source" position={Position.Top} id="plus" style={{...handleStyle, background: '#f1c40f'}} />
    <div>{createInput(data, '45px')}</div><div style={{ fontSize: '12px', color: '#f39c12', fontWeight: 'bold' }}>A</div>
    <Handle type="source" position={Position.Bottom} id="minus" style={handleStyle} />
  </div>
);
const VCVSNode = ({ data }: { data: any }) => (
  <div style={{ ...nodeStyle, border: '2px dashed #e67e22', transform: 'rotate(45deg)', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#e67e22' }}>VCVS</div>
      {createInput(data, '35px')} <span style={{fontSize: '10px'}}>xV</span>
    </div>
    <Handle type="source" position={Position.Left} id="cplus" title="Sensor (Control +)" style={{...handleStyle, background: '#3498db'}} /> 
    <Handle type="source" position={Position.Right} id="cminus" title="Sensor (Control -)" style={{...handleStyle, background: '#3498db'}} />
    <Handle type="source" position={Position.Top} id="plus" title="Output (Voltage +)" style={{...handleStyle, background: '#e74c3c'}} />  
    <Handle type="source" position={Position.Bottom} id="minus" title="Output (Voltage -)" style={handleStyle} />
  </div>
);
const VCCSNode = ({ data }: { data: any }) => (
  <div style={{ ...nodeStyle, border: '2px dashed #f39c12', transform: 'rotate(45deg)', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#f39c12' }}>VCCS</div>
      {createInput(data, '35px')} <span style={{fontSize: '10px'}}>xA</span>
    </div>
    <Handle type="source" position={Position.Left} id="cplus" title="Sensor (Control +)" style={{...handleStyle, background: '#3498db'}} /> 
    <Handle type="source" position={Position.Right} id="cminus" title="Sensor (Control -)" style={{...handleStyle, background: '#3498db'}} />
    <Handle type="source" position={Position.Top} id="plus" title="Output (Current +)" style={{...handleStyle, background: '#f1c40f'}} />  
    <Handle type="source" position={Position.Bottom} id="minus" title="Output (Current -)" style={handleStyle} />
  </div>
);
const GroundNode = () => (
  <div style={{ padding: '5px', textAlign: 'center' }}>
    <Handle type="source" position={Position.Top} id="gnd" style={handleStyle} />
    <div style={{ width: '30px', height: '4px', background: '#333', margin: '2px auto', borderRadius: '2px' }}></div>
    <div style={{ width: '20px', height: '4px', background: '#333', margin: '2px auto', borderRadius: '2px' }}></div>
    <div style={{ width: '10px', height: '4px', background: '#333', margin: '2px auto', borderRadius: '2px' }}></div>
  </div>
);
const nodeTypes = { resistor: ResistorNode, capacitor: CapacitorNode, inductor: InductorNode, voltage: VoltageNode, current: CurrentNode, vcvs: VCVSNode, vccs: VCCSNode, ground: GroundNode };
let idCounter = 0; const getId = (type: string) => `${type}_${idCounter++}`;

// --- MAIN CANVAS COMPONENT ---
const CircuitCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const {screenToFlowPosition} = useReactFlow();
  const [simData, setSimData] = useState<any>(null);
  const [timeIndex, setTimeIndex] = useState<number>(0);
  const [simDuration, setSimDuration] = useState<number | string>(5.0); 
  const [timeStep, setTimeStep] = useState<number | string>(0.01);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [pinMapping, setPinMapping] = useState<Map<string, number>>(new Map());
  // --- AUTOSAVE BOOTLOADER ---
  useEffect(() => {
    const savedNodes = localStorage.getItem('spice-nodes');
    const savedEdges = localStorage.getItem('spice-edges');
    if (savedNodes && savedEdges) {
      try {
        const parsedNodes = JSON.parse(savedNodes);
        const parsedEdges = JSON.parse(savedEdges);
        parsedNodes.forEach((n: Node) => {
          const parts = n.id.split('_');
          if (parts.length === 2) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num >= idCounter) idCounter = num + 1;
          }
        });
        const restoredNodes = parsedNodes.map((node: Node) => ({
          ...node,
          data: {
            ...node.data,
            onChange: (evt: any) => {
              setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) n.data = { ...n.data, value: evt.target.value };
                return n;
              }));
            }
          }
        }));
        setNodes(restoredNodes);
        setEdges(parsedEdges);
      } catch (e) { console.error("Failed to parse save data", e); }
    }
    setIsLoaded(true);
  }, []);
  // --- AUTOSAVE TRIGGER ---
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('spice-nodes', JSON.stringify(nodes));
      localStorage.setItem('spice-edges', JSON.stringify(edges));
    }
  }, [nodes, edges, isLoaded]);
  // --- CLEAR WORKSPACE BUTTON ---
  const clearWorkspace = () => {
    if(window.confirm("Are you sure you want to clear the entire circuit?")) {
      setNodes([]);
      setEdges([]);
      setSimData(null);
      localStorage.removeItem('spice-nodes');
      localStorage.removeItem('spice-edges');
      idCounter = 0;
    }
  };
  // --- EXPORT / IMPORT CIRCUITS ---
  const exportCircuit = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spice-circuit.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const importCircuit = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const restoredNodes = parsed.nodes.map((node: Node) => ({
          ...node,
          data: {
            ...node.data,
            onChange: (evt: any) => {
              setNodes((nds) => nds.map((n) => {
                if (n.id === node.id) n.data = { ...n.data, value: evt.target.value };
                return n;
              }));
            }
          }
        }));
        setNodes(restoredNodes);
        setEdges(parsed.edges);
        restoredNodes.forEach((n: Node) => {
          const parts = n.id.split('_');
          if (parts.length === 2) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num >= idCounter) idCounter = num + 1;
          }
        });
      } catch (err) {
        alert("Invalid circuit file!");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };
  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);
  const onDragOver = useCallback((event: any) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((event: any) => {
    event.preventDefault(); const type = event.dataTransfer.getData('application/reactflow'); if (!type) return;

    let val = 10;
    if (type === 'resistor') val = 1000; if (type === 'capacitor') val = 0.001; if (type === 'inductor') val = 1; 
    if (type === 'current') val = 1; if (type === 'vcvs' || type === 'vccs') val = 2;
    const newNode: Node = {
      id: getId(type), type, position: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      data: { value: val, onChange: (evt: any) => {
          setNodes((nds) => nds.map((node) => { 
            if (node.id === newNode.id) node.data = { ...node.data, value: evt.target.value }; 
            return node; 
          }));
        }
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition]);
  const generateNetlist = async () => {
    setIsPlaying(false); const pinMap = new Map(); let netCounter = 1;

    edges.forEach(edge => {
      const sourcePin = `${edge.source}-${edge.sourceHandle}`; const targetPin = `${edge.target}-${edge.targetHandle}`;
      const sourceNet = pinMap.get(sourcePin); const targetNet = pinMap.get(targetPin);
      if (sourceNet && targetNet) { for (let [key, val] of pinMap.entries()) if (val === targetNet) pinMap.set(key, sourceNet); }
      else if (sourceNet) pinMap.set(targetPin, sourceNet); else if (targetNet) pinMap.set(sourcePin, targetNet);
      else { pinMap.set(sourcePin, netCounter); pinMap.set(targetPin, netCounter); netCounter++; }
    });
    let groundNet: null | number = null;
    nodes.filter(n => n.type === 'ground').forEach(gnd => { if (pinMap.has(`${gnd.id}-gnd`)) groundNet = pinMap.get(`${gnd.id}-gnd`); });
    if (groundNet !== null) { for (let [key, val] of pinMap.entries()) if (val === groundNet) pinMap.set(key, 0); }

    const uniqueNets = new Set<number>(); for (let val of pinMap.values()) if (val !== 0) uniqueNets.add(val);
    const sortedNets = Array.from(uniqueNets).sort((a, b) => a - b);
    const remappedNets = new Map<number, number>(); remappedNets.set(0, 0);
    
    let sequentialCounter = 1; sortedNets.forEach(oldNet => remappedNets.set(oldNet, sequentialCounter++));
    for (let [key, val] of pinMap.entries()) pinMap.set(key, remappedNets.get(val));
    setPinMapping(pinMap);
    const spiceLines: string[] = [`.TRAN ${timeStep} ${simDuration}`];
    
    nodes.forEach(node => {
      const n1 = pinMap.get(`${node.id}-plus`) || 0; const n2 = pinMap.get(`${node.id}-minus`) || 0;     
      // If the input box is completely blank
      const val = node.data.value || 0;      
      if (node.type === 'resistor') spiceLines.push(`R_${node.id} ${n1} ${n2} ${val}`);
      else if (node.type === 'capacitor') spiceLines.push(`C_${node.id} ${n1} ${n2} ${val}`);
      else if (node.type === 'inductor') spiceLines.push(`L_${node.id} ${n1} ${n2} ${val}`);
      else if (node.type === 'voltage') spiceLines.push(`V_${node.id} ${n1} ${n2} ${val}`);
      else if (node.type === 'current') spiceLines.push(`I_${node.id} ${n1} ${n2} ${val}`);
      else if (node.type === 'vcvs') spiceLines.push(`E_${node.id} ${n1} ${n2} ${pinMap.get(`${node.id}-cplus`)||0} ${pinMap.get(`${node.id}-cminus`)||0} ${val}`);
      else if (node.type === 'vccs') spiceLines.push(`G_${node.id} ${n1} ${n2} ${pinMap.get(`${node.id}-cplus`)||0} ${pinMap.get(`${node.id}-cminus`)||0} ${val}`);
    });

    try {
      if (!(window as any).createSolverModule) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script'); script.src = '/solver.js';
          script.onload = resolve; script.onerror = reject; document.body.appendChild(script);
        });
      }
      const wasmEngine = await (window as any).createSolverModule();
      const solver = new wasmEngine.CircuitEngine();
      const result = solver.solveNetlist(spiceLines.join('\n'));
      const parsedResult = JSON.parse(result);
      solver.delete();
      if (parsedResult.error) { 
        alert(
          "⚠️ Simulation Failed\n" +
          "Your circuit has an invalid or incomplete connection. To fix this, please ensure:\n" +
          "1. You have placed a Ground component.\n" +
          "2. There are no dangling wires or disconnected pins.\n" +
          "3. Voltage sources are not directly short-circuited."
        ); 
        return; 
      }
      setSimData(parsedResult); setTimeIndex(0);
    } catch (err) { console.error("WASM Error:", err); }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && simData) {
      interval = setInterval(() => {
        setTimeIndex(prev => { if (prev >= simData.time.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
      }, 20); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, simData]);

  useEffect(() => {
    if (!simData) return;
    setEdges((eds) => eds.map(edge => {
      const pin = `${edge.source}-${edge.sourceHandle}`; const netNum = pinMapping.get(pin);
      let rawVoltage = 0; if (netNum !== 0 && simData.nodes[`Net ${netNum}`]) rawVoltage = simData.nodes[`Net ${netNum}`][timeIndex];
      let color = '#555'; if (rawVoltage > 0.01) color = '#10b981'; else if (rawVoltage < -0.01) color = '#3498db';    
      const labelText = netNum === 0 ? `GND: 0V` : `Net ${netNum}: ${rawVoltage.toFixed(2)}V`;
      return { 
        ...edge, 
        label: labelText, 
        labelBgPadding: [6, 4], 
        labelBgBorderRadius: 4, 
        labelStyle: { fill: '#fff', fontWeight: 600, fontSize: '10px' }, 
        labelBgStyle: { fill: color }, 
        style: { strokeWidth: 3, stroke: color, transition: 'stroke 0.1s ease' }, 
        animated: Math.abs(rawVoltage) > 0.01 
      };
    }));
  }, [timeIndex, simData, pinMapping]);

  const renderGraph = () => {
    if (!simData) return <div style={{ color: '#555', textAlign: 'center', padding: '40px 0', fontSize: '12px' }}>Run simulation to view trace.</div>;
    const width = 260; const height = 120; const tMax = simData.time[simData.time.length - 1];
    let vMin = 0; let vMax = 0.1;
    Object.values(simData.nodes).forEach((arr: any) => { arr.forEach((v: number) => { if (v < vMin) vMin = v; if (v > vMax) vMax = v; }); });
    const vRange = vMax - vMin || 1;
    const colors = [ '#c953f7', '#ffc527', '#1af943', '#ff5c2a', '#0cfbff', '#103cff',];
    // Calculate exact percentage from the top for the 0V line
    const zeroYPercent = ((vMax - 0) / vRange) * 100;
    // Only show the 0V line if 0V is actually between our Min and Max voltages
    const showZero = vMin <= 0 && vMax >= 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* 1. THE LEGEND */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', padding: '0 2px' }}>
          {Object.keys(simData.nodes).map((netName, idx) => (
            <div key={netName} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#cbd5e1', fontWeight: 600 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[idx % colors.length], boxShadow: `0 0 4px ${colors[idx % colors.length]}` }}></div>
              {netName}
            </div>
          ))}
        </div>

        {/* 2. GRAPH CONTAINER */}
        <div style={{ position: 'relative', paddingLeft: '40px', paddingBottom: '16px', marginTop: '4px' }}>            
            {/* Y-Axis Labels */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: '16px', width: '35px' }}>
                <span style={{ position: 'absolute', top: '-5px', right: 0, fontSize: '10px', color: '#c8e9ff', fontFamily: 'monospace' }}>{vMax.toFixed(2)}V</span>                
                {/* 0V Label */}
                {showZero && (
                    <span style={{ position: 'absolute', top: `calc(${zeroYPercent}% - 10px)`, right: 0, fontSize: '10px', color: '#c8e9ff', fontWeight: 'bold', fontFamily: 'monospace' }}>0V</span>
                )}                
                <span style={{ position: 'absolute', bottom: '-5px', right: 0, fontSize: '10px', color: '#c8e9ff', fontFamily: 'monospace' }}>{vMin.toFixed(2)}V</span>
            </div>
            {/* X-Axis Label */}
            <div style={{ position: 'absolute', left: '40px', right: 0, bottom: 0, height: '16px' }}>
                <span style={{ position: 'absolute', right: 0, bottom: 0, fontSize: '10px', color: '#c8e9ff', fontFamily: 'monospace' }}>{tMax}s</span>
            </div>
            {/* THE SVG GRAPH */}
            <svg width="100%" height="120px" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ background: '#0f172a', borderRadius: '4px', border: '1px solid #334155' }}>            
            {/* Zero Line */}
            {showZero && (
                <line x1="0" y1={height - ((0 - vMin) / vRange) * height} x2={width} y2={height - ((0 - vMin) / vRange) * height} stroke="#ffffff" strokeDasharray="4" strokeWidth="1" opacity="0.8" />
            )}            
            {/* Traces */}
            {Object.entries(simData.nodes).map(([netName, vArr]: any, idx) => {
              const points = vArr.map((v: number, i: number) => `${(simData.time[i] / tMax) * width},${height - ((v - vMin) / vRange) * height}`).join(' ');
              return <polyline key={netName} points={points} fill="none" stroke={colors[idx % colors.length]} strokeWidth="2" style={{ filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,0.2))' }} />;
            })}           
            {/* Playhead */}
            <line x1={(simData.time[timeIndex] / tMax) * width} y1="0" x2={(simData.time[timeIndex] / tMax) * width} y2={height} stroke="#fff" strokeWidth="1" />           
          </svg>
        </div>

      </div>
    );
  };
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc' }}>
      
      {/* LEFT CANVAS AREA */}
      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect} 
          onDrop={onDrop} 
          onDragOver={onDragOver} 
          nodeTypes={nodeTypes} 
          connectionMode={ConnectionMode.Loose} 
          defaultEdgeOptions={{ type: 'step', style: { strokeWidth: 2, stroke: '#94a3b8' } }} 
          connectionRadius={15}
          deleteKeyCode={['Backspace', 'Delete']} 
        >
          <Background color="#cbd5e1" gap={16} size={2} />
          <Controls style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: 'none' }} />
        </ReactFlow>
      </div>

      {/* CONTROL SIDEBAR */}
      <div style={{ width: '320px', backgroundColor: '#1e293b', color: '#f8fafc', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #0f172a', boxShadow: '-4px 0 15px rgba(0,0,0,0.2)', zIndex: 10 }}>        
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #334155', backgroundColor: '#0f172a' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '0.5px' }}>WASM-Spice</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Real-time MNA Circuit Simulator</p>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}> 
          {/* Section 1: Palette */}
          <div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Components</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'voltage')} style={{ padding: '10px 8px', borderLeft: '4px solid #e74c3c', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const, transition: 'background 0.2s' }}>DC Voltage</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'current')} style={{ padding: '10px 8px', borderLeft: '4px solid #f1c40f', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const }}>DC Current</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'resistor')} style={{ padding: '10px 8px', borderLeft: '4px solid #bdc3c7', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const }}>Resistor</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'capacitor')} style={{ padding: '10px 8px', borderLeft: '4px solid #3498db', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const }}>Capacitor</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'inductor')} style={{ padding: '10px 8px', borderLeft: '4px solid #9b59b6', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const }}>Inductor</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'ground')} style={{ padding: '10px 8px', borderLeft: '4px solid #7f8c8d', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const }}>Ground</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'vcvs')} style={{ padding: '10px 8px', borderLeft: '4px dashed #e67e22', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const }}>VCVS (Gain)</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'vccs')} style={{ padding: '10px 8px', borderLeft: '4px dashed #f39c12', backgroundColor: '#334155', borderRadius: '4px', fontSize: '12px', cursor: 'grab', textAlign: 'center' as const }}>VCCS (Gm)</div>
            </div>
          </div>
          {/* Section 2: Sim Settings */}
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '6px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Transient Settings</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Stop Time (sec)</span>
              <input type="number" className="nodrag" value={simDuration} step="0.1" onChange={(e) => setSimDuration(e.target.value)} style={{ width: '70px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '4px', padding: '4px', textAlign: 'center', fontSize: '12px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Time Step (sec)</span>
              <input type="number" className="nodrag" value={timeStep} step="0.001" onChange={(e) => setTimeStep(e.target.value)} style={{ width: '70px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '4px', padding: '4px', textAlign: 'center', fontSize: '12px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={generateNetlist} style={{ flex: 2, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
              ▶ Run Simulation
            </button>
            <button onClick={clearWorkspace} style={{ flex: 1, backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
              Clear
            </button>
          </div>
          {/* IMPORT & EXPORT */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={exportCircuit} style={{ flex: 1, backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
              ⬇ Save {/*.json*/}
            </button>
            <label style={{ flex: 1, backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '8px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}>
              ⬆ Upload {/*.json*/}
              <input type="file" accept=".json" onChange={importCircuit} style={{ display: 'none' }} />
            </label>
          </div>
          {/* Section 3: Oscilloscope & Playback */}
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '6px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Oscilloscope</h3>
              <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace', backgroundColor: '#0c4a6e', padding: '2px 6px', borderRadius: '10px' }}>
                {simData ? simData.time[timeIndex].toExponential(2) : "0.00"}s
              </span>
            </div>
            {renderGraph()}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
              <button onClick={() => setIsPlaying(!isPlaying)} disabled={!simData} style={{ background: simData ? '#38bdf8' : '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: simData ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 'bold' }}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <input type="range" min="0" max={simData ? simData.time.length - 1 : 100} value={timeIndex} onChange={(e) => { setTimeIndex(parseInt(e.target.value)); setIsPlaying(false); }} disabled={!simData} style={{ flex: 1, cursor: simData ? 'pointer' : 'not-allowed', accentColor: '#38bdf8' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default function App() { return <ReactFlowProvider><CircuitCanvas /></ReactFlowProvider>; }