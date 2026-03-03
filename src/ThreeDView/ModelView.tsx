import { FC, useRef, RefObject, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { Emitter } from 'mitt';
import { SyncedCameraControls } from './SyncedCameraControls';
import { CameraOperationEvent } from './SyncedCameraControls';
import { ModelManageEvent, ModelManager } from './ModelManager';

function Loader() {
  const { progress } = useProgress() // 読み込み進捗率 (0-100)
  return (
    <Html center>
      <div style={{ 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '20px',
        whiteSpace: 'nowrap'
      }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  )
}

const ModelView: FC<{
  syncCamera: boolean;
  viewId: string;
  modelManageEmitter: RefObject<Emitter<ModelManageEvent>>;
  cameraOperationEmitter: RefObject<Emitter<CameraOperationEvent>>;
}> = ({ syncCamera, viewId, modelManageEmitter, cameraOperationEmitter }) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <Canvas
      style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
      dpr={[1, 1.5]}
      onPointerMissed={() => console.log("Canvasは反応してるが、モデルには当たってない")}
      orthographic
    >
      <Suspense fallback={<Loader/>}>
        <SyncedCameraControls syncCamera={syncCamera} viewId={viewId} targetObject={groupRef} cameraOperationEmitter={cameraOperationEmitter} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[10, 10, 10]} />
        <axesHelper args={[5]}/>
        <ModelManager  
          groupRef={groupRef}
          modelManageEmitter={modelManageEmitter}
        />
      </Suspense>
    </Canvas>
  );
};

export default ModelView;
