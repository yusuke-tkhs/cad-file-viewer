import { FC, memo, MutableRefObject, ReactNode, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Edges, Box, OrbitControls } from '@react-three/drei';
import SharedOrbitControls, { CameraState } from './SharedOrbitControls';

const ThreeDView: FC<{
  orbitControl: (canvasRef: MutableRefObject<HTMLCanvasElement | null>) => ReactNode;
}> = memo(({ orbitControl }) => {
  // const cameraProps = {
  //   left: -5,
  //   right: 5,
  //   top: 5,
  //   bottom: -5,
  //   near: -20,
  //   far: 100,
  // };
  const canvasRef = useRef(null);

  return (
    <Canvas
      ref={canvasRef}
      style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
      orthographic
      // camera={sharedCamera}
    >
      {/* 立方体のレンダリング */}

      {/* <OrbitControls
        zoomToCursor={true}
        // OrbitControlsのdamping factorの設定はこれを参考にした
        // https://ics.media/tutorial-three/camera_orbitcontrols/
        enableDamping={true}
        dampingFactor={0.2}
      /> */}
      {/* <SharedOrbitControls enabled={true}/> */}
      {orbitControl(canvasRef)}
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
