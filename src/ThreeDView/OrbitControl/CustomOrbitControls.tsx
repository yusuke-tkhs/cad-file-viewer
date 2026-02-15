import { FC, useRef, useState, useEffect, MutableRefObject } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, ConstantColorFactor } from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/addons';
import { useRecoilState } from 'recoil';
import { sharedCameraState } from './sharedCameraState';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from '../ThreeDViewEvent';
extend({ OrbitControls });

// Default frustum sizes from defaultCamera.ts
const DEFAULT_FRUSTUM_WIDTH = 1980;
const DEFAULT_FRUSTUM_HEIGHT = 1080;

// OrbitControls which supports syncronization of cameras between multi canvases.
const CustomOrbitControls: FC<{
  syncCamera: boolean;
  eventEmitterRef: MutableRefObject<Emitter<ThreeDViewEvent>>;
}> = ({ syncCamera, eventEmitterRef }) => {
  const [orbitOperating, setOrbitOperating] = useState(false);
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const orbitControl = useRef<ThreeOrbitControls>(new ThreeOrbitControls(camera, domElement));
  const [sharedCamera, setCameraState] = useRecoilState(sharedCameraState);

  useEffect(() => {
    if (!(camera instanceof OrthographicCamera)) {
      return;
    }

    domElement.addEventListener('contextmenu', (e) => e.preventDefault()); // 右クリックメニューを無効化

    // add event listener for 3D view specific event
    eventEmitterRef.current.on('recenterModel', ({ scene }) => {
      console.log('recenter called');
      // const box = new Box3().setFromObject(scene);
      // const size = box.getSize(new Vector3());
      // console.log('box size:', size);

      // // Centerコンポーネントでモデルが中央に配置されているので、targetは(0,0,0)
      // const maxDim = Math.max(size.x, size.y, size.z);
      // console.log('maxDim:', maxDim);
      // const aspect = DEFAULT_FRUSTUM_WIDTH / DEFAULT_FRUSTUM_HEIGHT;

      // // モデルが収まるようにzoomを計算
      // const zoomX = DEFAULT_FRUSTUM_WIDTH / (maxDim * aspect);
      // const zoomY = DEFAULT_FRUSTUM_HEIGHT / maxDim;
      // const zoom = Math.min(zoomX, zoomY) * 0.9; // 少し余裕を持たせる
      // console.log('zoom:', zoom);

      // // カメラの位置を固定
      // camera.position.set(0, maxDim * 10, 0);
      // console.log('camera position:', camera.position);

      // // zoomを設定
      // camera.zoom = zoom;
      // camera.updateProjectionMatrix();

      // orbitControl.current.target.set(0, 0, 0);
      // console.log('target:', orbitControl.current.target);
      // orbitControl.current.update();
      // orbitControl.current.saveState();

      const box = new Box3().setFromObject(scene);

      // 視点をモデルの中心に向ける
      const center = new Vector3();
      box.getCenter(center);
      camera.lookAt(center);
      console.log('center:', center);

      // モデルが収まるようにzoomを計算
      const size = box.getSize(new Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const aspect = DEFAULT_FRUSTUM_WIDTH / DEFAULT_FRUSTUM_HEIGHT;
      const zoomX = DEFAULT_FRUSTUM_WIDTH / (maxDim * aspect);
      const zoomY = DEFAULT_FRUSTUM_HEIGHT / maxDim;
      const zoom = Math.min(zoomX, zoomY) * 0.9; // 少し余裕を持たせる
      console.log('zoom:', zoom);
      camera.zoom = zoom;

      // カメラの位置を固定
      // camera.position.set(0, maxDim * 10, 0);
      // console.log('camera position:', camera.position);

      camera.updateProjectionMatrix();

      orbitControl.current.target.set(0, 0, 0);
      console.log('target:', orbitControl.current.target);
      orbitControl.current.update();
      orbitControl.current.saveState();

      if (syncCamera) {
        setCameraState({ camera: camera.clone(), target: orbitControl.current.target.clone() });
      }
    });

    return () => {
      domElement.removeEventListener('contextmenu', (e) => e.preventDefault());
      eventEmitterRef.current.off('recenterModel');
    };
  });

  useFrame(() => {
    console.log('orbitOperating:', orbitOperating);
    console.log('sharedCamera:', sharedCamera);
    if (orbitOperating && syncCamera && camera instanceof OrthographicCamera) {
      setCameraState({ camera: camera.clone(), target: orbitControl.current.target.clone() });
    } else if (syncCamera && !orbitOperating && sharedCamera) {
      console.log('syncing camera');
      const { camera: sharedCam, target } = sharedCamera;
      camera.position.copy(sharedCam.position);
      camera.quaternion.copy(sharedCam.quaternion);
      camera.zoom = sharedCam.zoom;
      orbitControl.current.target.copy(target);
      orbitControl.current.update();
      camera.updateProjectionMatrix();
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
      camera={camera}
      enableDamping={false}
      enablePan={true}
      zoomToCursor={true}
    />
  );
};

export default CustomOrbitControls;
