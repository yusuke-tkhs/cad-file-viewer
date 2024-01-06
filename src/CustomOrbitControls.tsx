import { FC, useRef, useState, useEffect } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrthographicCamera } from 'three';
import { useRecoilState } from 'recoil';
import { sharedCameraState } from './sharedCameraState';

extend({ OrbitControls });

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

const WHEEL_EVENT_DEBOUNCE_TIME = 200;
const WHEEL_EVENT_THROTTLE_TIME = 50;

// OrbitControls which supports syncronization of cameras between multi canvases.
const CustomOrbitControls: FC<{ syncCamera: boolean }> = ({ syncCamera }) => {
  const [orbitOperating, setOrbitOperating] = useState(false); // pan / rotate (mouse drag)
  const [zoomOperating, setZoomOperating] = useState(false); // zoom (mouse wheel)
  const operating = orbitOperating || zoomOperating;
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const debounceRef = useRef<number | null>(null);
  const [sharedCamera, setCameraState] = useRecoilState(sharedCameraState);

  useEffect(() => {
    if (!(camera instanceof OrthographicCamera)) {
      return;
    }
    const onWheel = () => {
      setZoomOperating(true);
      if (syncCamera) {
        setCameraState(camera.clone());
      }
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        // This function is executed when wheel operation is considered as finished.
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
    if (syncCamera && !operating) {
      // const { position, quaternion, rotation, zoom } = sharedCamera;
      const { position, quaternion, rotation, zoom } = sharedCamera;
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
        if (operating && e?.target.object instanceof OrthographicCamera) {
          setCameraState(e.target.object.clone());
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

export default CustomOrbitControls;
