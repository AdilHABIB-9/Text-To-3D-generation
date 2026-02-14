import React, { useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import axios from 'axios';

// Component to handle model appearance, orientation, and "Anti-Black" fix
function Model({ url }) {
  const obj = useLoader(OBJLoader, url);
  
  obj.traverse((child) => {
    if (child.isMesh) {
      // 1. Force a bright material to prevent black objects
      child.material.color.set('#ffffff'); 
      // 2. Add an emissive glow so the object is visible even in shadow
      child.material.emissive.set('#333333'); 
      child.material.roughness = 0.4;
      child.material.metalness = 0.3;
      // 3. Disable flat shading to smooth out the diffusion "blobs"
      child.material.flatShading = false; 
    }
  });

  // rotation={[-Math.PI / 2, 0, 0]} fixes the model facing the floor
  return <primitive object={obj} scale={3.5} rotation={[-Math.PI / 2, 0, 0]} />;
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return alert("Please enter a description!");
    setLoading(true);
    try {
      // UPDATE THIS URL FROM COLAB EVERY SESSION
      const COLAB_URL = "https://antonomastically-unsurrendering-ranee.ngrok-free.dev"; 
      
      const response = await axios.post(`${COLAB_URL}/generate`, 
        { prompt: prompt }, 
        { responseType: 'blob' }
      );
      
      const url = URL.createObjectURL(response.data);
      setModelUrl(url);
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Error: Connection lost. Ensure Colab and Ngrok are running.");
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', 
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', // Light blue CAD theme
      fontFamily: 'sans-serif' 
    }}>
      
      <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.8)', borderBottom: '2px solid #1976d2' }}>
        <h1 style={{ margin: 0, color: '#1565c0' }}>3D GenAI Explorer</h1>
        <p style={{ margin: '5px 0', opacity: 0.7 }}>EIDIA Project | Habib Adil & El Asmi Bakr</p>
        
        <div style={{ marginTop: '15px' }}>
          <input 
            type="text" value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Ex: a sleek vintage car..."
            style={{ padding: '12px', width: '350px', borderRadius: '25px', border: '1px solid #90caf9' }}
          />
          <button 
            onClick={handleGenerate} disabled={loading}
            style={{ padding: '12px 25px', marginLeft: '10px', borderRadius: '25px', border: 'none', background: '#1e88e5', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? "SCULPTING (128 STEPS)..." : "GENERATE 3D"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 2, 7]} fov={35} />
          
          {/* 360-DEGREE LIGHTING COVERAGE */}
          <hemisphereLight intensity={1.5} groundColor="#bbdefb" color="#ffffff" /> 
          <ambientLight intensity={1.0} /> 
          <pointLight position={[10, 10, 10]} intensity={2.5} />
          <directionalLight position={[-5, 5, 5]} intensity={2} />

          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6} contactShadow={true} adjustCamera={true}>
              {modelUrl && <Model url={modelUrl} />}
            </Stage>
          </Suspense>
          <OrbitControls makeDefault autoRotate={!!modelUrl} autoRotateSpeed={2} />
        </Canvas>
      </div>

      <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#1565c0' }}>
        Distributed Big Data Architecture | GPU: Tesla T4 | Model: Shap-E | Quality: 128 Steps
      </div>
    </div>
  );
}

export default App;
