import { FC, memo, MutableRefObject, ReactNode, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Edges, Box } from '@react-three/drei';
import { Flex } from '@radix-ui/themes';
import { MeshRef, MeshRefContent } from './meshRef';
import CustomOrbitControls from './CustomOrbitControls';

const ThreeDView: FC<{
  syncCamera: boolean;
  toolBar: (meshRef: MeshRef) => ReactNode;
}> = memo(({ syncCamera, toolBar }) => {
  const meshRef = useRef<MeshRefContent>(null);

  return (
    <Flex direction='column'>
      {toolBar(meshRef)}
      <Canvas
        style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
        orthographic
      >
        {/* サンプルとして立方体をレンダリング */}

        <CustomOrbitControls syncCamera={syncCamera} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh ref={meshRef}>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial attach='material' color='green' />
          <Edges>
            <Box args={[1, 1, 1]} />
          </Edges>
        </mesh>
      </Canvas>
    </Flex>
  );
});

export default ThreeDView;
