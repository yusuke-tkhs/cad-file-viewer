import { FC, useRef, useState, useEffect, MutableRefObject } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3 } from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/addons';
import { useRecoilState } from 'recoil';
import { sharedCameraState } from './sharedCameraState';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from '../ThreeDViewEvent';
import {DEFAULT_CAMERA} from './defaultCamera'
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
const RECENTER_ZOOM_FACTOR = 1.5;

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
  const orbitControl = useRef<ThreeOrbitControls>(new ThreeOrbitControls(camera, domElement));
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
    eventEmitterRef.current.on('recenterModel', ({ scene }) => {
      console.log('called!!!!!');
      // const box = new Box3().setFromObject(scene);
      // const size = box.getSize(new Vector3()).length();
      // const center = box.getCenter(new Vector3());
      // console.log(size);
      // let newCamera = DEFAULT_CAMERA.clone()
      // newCamera.position.copy(center);
      // newCamera.position.x += size / 2.0;
			// newCamera.position.y += size / 5.0;
			// newCamera.position.z += size / 2.0;
      // newCamera.lookAt(center);
      // newCamera.updateProjectionMatrix();
      // if (syncCamera) {
      //   // When Syncing camera mode is ON,
      //   // All cameras not operated by user should be updated
      //   //   from shared camera state in useFrame.
      //   // So, here we must not update camera directly.
      //   setCameraState(newCamera);
      // } else {
      //   const { position, quaternion, rotation, zoom } = newCamera;
      //   camera.position.copy(position);
      //   camera.quaternion.copy(quaternion);;
      //   camera.rotation.copy(rotation);
      //   camera.zoom = zoom
      //   camera.updateProjectionMatrix();
      //   orbitControl.current.target.copy(center);
      //   orbitControl.current.update();
      //   orbitControl.current.saveState();
        
      //   // const actualCameraDistance = cameraDistance * 3;
      //   // camera.position.set(x, y, z);
      //   // camera.translateZ(-actualCameraDistance);
      //   // camera.left = -frustumCubeHalfSize;
      //   // camera.right = frustumCubeHalfSize;
      //   // camera.top = frustumCubeHalfSize;
      //   // camera.bottom = -frustumCubeHalfSize;
      //   // camera.far = -actualCameraDistance - frustumCubeHalfSize;
      //   // camera.near = -actualCameraDistance + frustumCubeHalfSize;
        
        

        
      //   // // camera.zoom =100;
      //   // orbitControl.current.update();
      //   // //camera.position.set(x, y, z);
        
      //   // //camera.far = far;
        
      //   camera.updateProjectionMatrix();
      // }
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
