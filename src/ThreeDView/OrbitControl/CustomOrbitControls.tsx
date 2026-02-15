import { FC, useRef, useState, useEffect, MutableRefObject, useCallback } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, CameraControls } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, ConstantColorFactor, Sphere } from 'three';
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
  const [zoomOperating, setZoomOperating] = useState(false);
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const changeTimeoutRef = useRef<number | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);
  const [sharedCamera, setCameraState] = useRecoilState(sharedCameraState);
  const saveCameraState = useCallback(() => {
    if (cameraControlsRef.current) {

      console.log("called!!! saveCameraState");
      // カメラの視線を取得
      let target = new Vector3();
      cameraControlsRef.current.getTarget(target);

      // // カメラのズームを取得
      const zoom = cameraControlsRef.current.camera.zoom;
      console.log("saved zoom", zoom);

      setCameraState({ position: cameraControlsRef.current.camera.position.clone(), target: target.clone(), zoom });
      // setCameraState({ position: cameraControlsRef.current.camera.position.clone(), target: target.clone() });
    }
  }, [cameraControlsRef, setCameraState]);

  // const handleChangeCallBack = useCallback(() => {
  //   // 1. 動いたら即座にフラグをオンにする
  //   setOrbitOperating(true);

  //   // 2. 前回のタイマーがあればキャンセル（連続して発火している間はオフにさせない）
  //   if (changeTimeoutRef.current) {
  //     clearTimeout(changeTimeoutRef.current);
  //   }

  //   // 3. 100ms間、次の呼び出しがなければフラグをオフにする
  //   changeTimeoutRef.current = window.setTimeout(() => {
  //     console.log('ズーム（距離）が変更されました2:');
  //     setOrbitOperating(false);
  //     changeTimeoutRef.current = null; // 掃除
  //   }, 50);
  // }, [setOrbitOperating]);

  // 前回の距離を保持するための Ref
  const lastDistanceRef = useRef(0)

  const handleChange = useCallback(() => {
    if (!cameraControlsRef.current) return

    // 現在のカメラとターゲットの距離を取得
    const currentZoom = cameraControlsRef.current.camera.zoom;

    // 前回と異なる場合のみ処理を実行（誤差を考慮して差分で判定すると安定します）
    if (Math.abs(lastDistanceRef.current - currentZoom) > 0.001) {
      console.log('ズーム（距離）が変更されました:', currentZoom)
      
      // ここにズーム時の処理を書く（例: setZoomOperating(true) など）
      setOrbitOperating(true);
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      changeTimeoutRef.current = window.setTimeout(() => {
        // console.log('ズーム（距離）が変更されました2:');
        setOrbitOperating(false);
        changeTimeoutRef.current = null; // 掃除
      }, 500);

      // 値を更新
      lastDistanceRef.current = currentZoom
    }
  }, [])


  useEffect(() => {
    if (!(camera instanceof OrthographicCamera)) {
      return;
    }

    domElement.addEventListener('contextmenu', (e) => e.preventDefault()); // 右クリックメニューを無効化

    // add event listener for 3D view specific event
    eventEmitterRef.current.on('recenterModel', ({ scene }) => {
      console.log('recenter called');
      const box = new Box3().setFromObject(scene);
      const boundingSphere = new Sphere();
      box.getBoundingSphere(boundingSphere);  // ボックスからスフィアを計算
      cameraControlsRef.current?.fitToSphere(boundingSphere, true); // スフィアにフィットさせる
      
      console.log('fit to box done');

      if (syncCamera) {
        saveCameraState();
      }
    });

    return () => {
      domElement.removeEventListener('contextmenu', (e) => e.preventDefault());
      eventEmitterRef.current.off('recenterModel');
    };
  }, [camera, domElement, eventEmitterRef, syncCamera, saveCameraState]);

  // useEffect(() => {
  //   if (cameraControlsRef.current) {
  //     const handleUpdate = () => {
  //       console.log('カメラが更新されました（ズーム含む）');
  //       if (syncCamera && !orbitOperating) {
  //         saveCameraState();
  //       }
  //     };

  //     cameraControlsRef.current.addEventListener('update', handleUpdate);

  //     return () => {
  //       cameraControlsRef.current?.removeEventListener('update', handleUpdate);
  //     };
  //   }
  // }, [cameraControlsRef, syncCamera, orbitOperating, saveCameraState]);

  useFrame(() => {
    if (orbitOperating && syncCamera && camera instanceof OrthographicCamera) {
      saveCameraState();
    } else 
    if (syncCamera && !orbitOperating && sharedCamera && cameraControlsRef.current) {
    // if (syncCamera && !orbitOperating && sharedCamera && cameraControlsRef.current) {
      const { position, target, zoom } = sharedCamera;
      cameraControlsRef.current.setPosition(position.x, position.y, position.z);
      cameraControlsRef.current.setTarget(target.x, target.y, target.z);
      cameraControlsRef.current.zoomTo(zoom, true);
    }
    if (cameraControlsRef.current) {
      cameraControlsRef.current.update(1);
    }
  });

  return (
    <CameraControls
      ref={cameraControlsRef}
      domElement={domElement}
      onStart={() => {
        console.log('camera onStart');
        setOrbitOperating(true);
      }}
      onEnd={() => {
        console.log('camera onEnd');
        setOrbitOperating(false);
      }}
      // onChange={handleChangeCallBack}
      onChange={()=>{
        handleChange();
      }}
      camera={camera}
      makeDefault
    />
  );
};

export default CustomOrbitControls;
