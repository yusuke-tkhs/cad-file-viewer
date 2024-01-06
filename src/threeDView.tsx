import { FC, memo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Edges, Box } from '@react-three/drei';
import { Flex } from '@radix-ui/themes';
import ThreeDViewMenuBar from './ThreeDViewMenuBar';
import { MeshRefContent } from './meshRef';
import CustomOrbitControls from './CustomOrbitControls';

import mitt from 'mitt';
import { ThreeDViewEvent } from './ThreeDViewEvent';

const ThreeDView: FC<{ syncCamera: boolean }> = memo(({ syncCamera }) => {
  const meshRef = useRef<MeshRefContent>(null);
  const eventEmitter = useRef(mitt<ThreeDViewEvent>());
  const recenterHandler = () => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    mesh.geometry.computeBoundingSphere();
    const boundingSphere = mesh.geometry.boundingSphere;
    if (!boundingSphere) {
      return;
    }
    eventEmitter.current.emit('recenterModel', {
      cameraLookAt: mesh.localToWorld(boundingSphere.center),
      cameraDistance: boundingSphere.radius,
    });
  };

  return (
    <Flex direction='column'>
      <ThreeDViewMenuBar onRecenterButtonClicked={recenterHandler} />
      <Canvas
        style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
        orthographic
      >
        <CustomOrbitControls syncCamera={syncCamera} eventEmitterRef={eventEmitter} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh ref={meshRef}>
          {/* サンプルとして立方体をレンダリング */}
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
