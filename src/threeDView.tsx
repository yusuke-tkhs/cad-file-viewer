import { FC, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Edges, OrbitControls, Box } from '@react-three/drei';

const ThreeDView: FC = memo(() => {
  const cameraProps = {
    left: -5,
    right: 5,
    top: 5,
    bottom: -5,
    near: -20,
    far: 100,
  };
  return (
    <Canvas
      style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
      orthographic
      camera={cameraProps}
    >
      {/* 立方体のレンダリング */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <mesh>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial attach='material' color='orange' />
        <Edges>
          <Box args={[1, 1, 1]} />
        </Edges>
      </mesh>
    </Canvas>
  );
});

export default ThreeDView;
