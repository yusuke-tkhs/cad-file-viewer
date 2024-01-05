import { FC, memo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Edges, Box } from '@react-three/drei';

const ThreeDView: FC<{
  orbitControl: ReactNode;
}> = memo(({ orbitControl }) => {
  return (
    <Canvas
      style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
      orthographic
    >
      {/* サンプルとして立方体をレンダリング */}

      {orbitControl}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial attach='material' color='green' />
        <Edges>
          <Box args={[1, 1, 1]} />
        </Edges>
      </mesh>
    </Canvas>
  );
});

export default ThreeDView;
