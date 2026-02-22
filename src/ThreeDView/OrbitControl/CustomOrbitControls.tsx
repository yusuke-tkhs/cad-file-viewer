import { FC, useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, CameraControls } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, Sphere } from 'three';
import { useRecoilState } from 'recoil';
import { sharedCameraState } from './sharedCameraState';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from '../ThreeDViewEvent';

// カメラ同期用の変数
const sharedCameraParams = {
  position: new Vector3(0, 0, 0),
  target: new Vector3(0, 0, 0),
  zoom: 1,
};

// OrbitControls which supports syncronization of cameras between multi canvases.
const CustomOrbitControls: FC<{
  syncCamera: boolean;
  eventEmitterRef: RefObject<Emitter<ThreeDViewEvent>>;
}> = ({ syncCamera, eventEmitterRef }) => {
  const [orbitOperating, setOrbitOperating] = useState(false);
  const {
    camera,
    gl: { domElement },
  } = useThree();

  useEffect(() => {
    if (camera instanceof OrthographicCamera) {
      // 前後の描画限界を十分に広げる（数値はモデルの大きさに合わせて調整）
      camera.near = -10000; 
      camera.far = 10000;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  const changeTimeoutRef = useRef<number | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);
  const saveCameraState = useCallback(() => {
    if (cameraControlsRef.current) {

      console.log("called!!! saveCameraState");
      // カメラの視線を取得
      let target = new Vector3();
      cameraControlsRef.current.getTarget(target);

      sharedCameraParams.position.copy(cameraControlsRef.current.camera.position);
      sharedCameraParams.target.copy(target);
      sharedCameraParams.zoom = cameraControlsRef.current.camera.zoom;
    }
  }, [cameraControlsRef]);

  // 前回の距離を保持するための Ref
  const lastDistanceRef = useRef(0)

  const handleChange = useCallback(() => {
    if (!cameraControlsRef.current) {
      return;
    }

    // 現在のカメラとターゲットの距離を取得
    const currentZoom = cameraControlsRef.current.camera.zoom;

    // 前回と異なる場合のみ処理を実行（誤差を考慮して差分で判定すると安定します）
    if (Math.abs(lastDistanceRef.current - currentZoom) > 0.0001) {
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
  }, [cameraControlsRef])


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
    });

    return () => {
      domElement.removeEventListener('contextmenu', (e) => e.preventDefault());
      eventEmitterRef.current.off('recenterModel');
    };
  }, [camera, domElement, eventEmitterRef, syncCamera, saveCameraState]);

  useFrame((state, delta) => {
    if (orbitOperating && camera instanceof OrthographicCamera) {
      saveCameraState();
    } else if (syncCamera && !orbitOperating && cameraControlsRef.current) {
      const { position, target, zoom } = sharedCameraParams;
      cameraControlsRef.current.setLookAt(
        position.x, position.y, position.z,
        target.x, target.y, target.z,
        false // アニメーションさせない
      );
      cameraControlsRef.current.zoomTo(zoom, false); // アニメーションさせない
      // cameraControlsRef.current.
    }
    if (cameraControlsRef.current) {
      cameraControlsRef.current.update(delta);
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
