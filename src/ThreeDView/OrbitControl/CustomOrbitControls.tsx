import { FC, useRef, useState, useEffect, MutableRefObject, useCallback } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, CameraControls } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, Sphere } from 'three';
import { useRecoilState } from 'recoil';
import { sharedCameraState } from './sharedCameraState';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from '../ThreeDViewEvent';
extend({ OrbitControls });

// カメラ同期用の変数
// todo これを使った同期をやってみる
const sharedCameraParams = {
  position: new Vector3(0, 0, 0),
  target: new Vector3(0, 0, 0),
  zoom: 1,
};

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
    }
  }, [cameraControlsRef, setCameraState]);

  // 前回の距離を保持するための Ref
  const lastDistanceRef = useRef(0)

  const handleChange = useCallback(() => {
    if (!cameraControlsRef.current) return

    // 現在のカメラとターゲットの距離を取得
    const currentZoom = cameraControlsRef.current.camera.zoom;

    // 前回と異なる場合のみ処理を実行（誤差を考慮して差分で判定すると安定します）
    if (syncCamera && Math.abs(lastDistanceRef.current - currentZoom) > 0.0001) {
      // console.log('ズーム（距離）が変更されました:', currentZoom)
      
      
      // ここにズーム時の処理を書く（例: setZoomOperating(true) など）
      setOrbitOperating(true);
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      changeTimeoutRef.current = window.setTimeout(() => {
        // console.log('ズーム（距離）が変更されました:');
        setOrbitOperating(false);
        changeTimeoutRef.current = null; // 掃除
      }, 150);

      // 値を更新
      lastDistanceRef.current = currentZoom

    }
  }, [syncCamera, cameraControlsRef])


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

  useFrame(() => {
    if (orbitOperating && syncCamera && camera instanceof OrthographicCamera) {
      saveCameraState();
    } else if (syncCamera && !orbitOperating && sharedCamera && cameraControlsRef.current) {
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
      onChange={()=>{
        handleChange();
      }}
      camera={camera}
      makeDefault
    />
  );
};

export default CustomOrbitControls;
