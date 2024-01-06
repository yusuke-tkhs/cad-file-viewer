import { FC, useRef, useState, useEffect, MutableRefObject } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrthographicCamera } from 'three';
import { useRecoilState } from 'recoil';
import { sharedCameraState } from './sharedCameraState';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from './ThreeDViewEvent';
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
const RECENTER_ZOOM_FACTOR = 2;

// OrbitControls which supports syncronization of cameras between multi canvases.
const CustomOrbitControls: FC<{
  syncCamera: boolean;
  eventEmitterRef: MutableRefObject<Emitter<ThreeDViewEvent>>;
}> = ({ syncCamera, eventEmitterRef }) => {
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

    // event handling for wheel to implement camera sync
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

    // add event listener for 3D view specific event
    eventEmitterRef.current.on('recenterModel', ({ cameraLookAt, cameraDistance }) => {
      // from this thread
      // https://gamedev.stackexchange.com/questions/158177/how-to-move-the-camera-to-center-an-object-in-screen

      const [x, y, z] = cameraLookAt;
      if (syncCamera) {
        // When Syncing camera mode is ON,
        // All cameras not operated by user should be updated
        //   from shared camera state in useFrame.
        // So, here we must not update camera directly.
        const recenterdCamera = camera.clone();
        recenterdCamera.position.set(x, y, z);
        recenterdCamera.zoom = cameraDistance * RECENTER_ZOOM_FACTOR;
        recenterdCamera.updateProjectionMatrix();
        setCameraState(recenterdCamera);
      } else {
        camera.position.set(x, y, z);
        camera.zoom = cameraDistance * RECENTER_ZOOM_FACTOR;
        camera.updateProjectionMatrix();
      }
    });

    return () => {
      domElement.removeEventListener('wheel', throttledHandleWheel);
      eventEmitterRef.current.off('recenterModel');
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
