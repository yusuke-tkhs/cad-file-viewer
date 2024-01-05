import { FC, useRef, useState, useEffect } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Euler, Quaternion, Vector3, OrthographicCamera as ThreeOrthographicCamera } from 'three';

extend({ OrbitControls });

export interface CameraState {
  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  zoom: number;
}

export const defaultCameraState: CameraState = {
  position: new Vector3(0, 0, 5),
  rotation: new Euler(0, 0, 0, 'XYZ'),
  quaternion: new Quaternion(1, 1, 1, 1),
  zoom: 1,
};

// Too many mouse wheel events make zoom peformance bad.
// So throttle execution of mouse wheel event handler.
const throttledWheelHandler = (callback: (event: WheelEvent) => void, limit: number) => {
  let inThrottle: boolean;
  return (event: WheelEvent) => {
    if (!inThrottle) {
      callback(event);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const WHEEL_EVENT_DEBOUNCE_TIME = 500;
const WHEEL_EVENT_THROTTLE_TIME = 100;

const SharedOrbitControls: FC<{
  cameraState: CameraState;
  updateCameraStateFn: (cameraState: CameraState) => void;
  enableCameraSync: boolean;
}> = ({ cameraState, updateCameraStateFn, enableCameraSync: enabled }) => {
  const [orbitOperating, setOrbitOperating] = useState(false); // pan / rotate (mouse drag)
  const [zoomOperating, setZoomOperating] = useState(false); // zoom (mouse wheel)
  const operating = orbitOperating || zoomOperating;
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!(camera instanceof ThreeOrthographicCamera)) {
      return;
    }
    const onWheel = () => {
      setZoomOperating(true);
      updateCameraStateFn({
        position: camera.position,
        rotation: camera.rotation,
        quaternion: camera.quaternion,
        zoom: camera.zoom,
      });

      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        // ホイールイベント終了時の処理
        debounceRef.current = null;
        setZoomOperating(false);
      }, WHEEL_EVENT_DEBOUNCE_TIME);
    };
    const throttledHandleWheel = throttledWheelHandler(onWheel, WHEEL_EVENT_THROTTLE_TIME);
    domElement.addEventListener('wheel', throttledHandleWheel);
    return () => {
      domElement.removeEventListener('wheel', throttledHandleWheel);
    };
  });

  useFrame(() => {
    if (enabled && !operating) {
      const { position, quaternion, rotation, zoom } = cameraState;
      camera.position.set(position.x, position.y, position.z);
      camera.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      camera.rotation.set(rotation.x, rotation.y, rotation.z);
      if (camera.zoom != zoom) {
        camera.zoom = zoom;
        camera.updateProjectionMatrix();
      }
    }
  });

  return (
    <OrbitControls
      domElement={domElement}
      onStart={() => {
        setOrbitOperating(true);
      }}
      onEnd={() => {
        setOrbitOperating(false);
      }}
      onChange={(e) => {
        if (operating && e?.target.object instanceof ThreeOrthographicCamera) {
          const camera = e.target.object;
          updateCameraStateFn({
            position: camera.position,
            rotation: camera.rotation,
            quaternion: camera.quaternion,
            zoom: camera.zoom,
          });
        }
      }}
      camera={camera}
      enableDamping={true}
      zoomSpeed={2}
      zoomToCursor={true}
      dampingFactor={0.2}
    />
  );
};

export default SharedOrbitControls;
