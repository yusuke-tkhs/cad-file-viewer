import { FC, useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { useFrame, extend, useThree, Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, CameraControls, useGLTF, Center } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, Sphere, Quaternion, LoadingManager, REVISION } from 'three';
import { GLTF, GLTFLoader, DRACOLoader, KTX2Loader } from 'three/addons';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { useRecoilState } from 'recoil';
import { sharedCameraState } from './sharedCameraState';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from '../ThreeDViewEvent';

const MANAGER = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
	`${THREE_PATH}/examples/jsm/libs/draco/gltf/`,
);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
	`${THREE_PATH}/examples/jsm/libs/basis/`,
);

// カメラ同期用の変数
const sharedCameraParams = {
  position: new Vector3(0, 0, 0),
  target: new Vector3(0, 0, 0),
  quaternion: new Quaternion(),
  zoom: 1,
};

// OrbitControls which supports syncronization of cameras between multi canvases.
const CustomOrbitControls: FC<{
  syncCamera: boolean;
  viewId: string;
  eventEmitterRef: RefObject<Emitter<ThreeDViewEvent>>;
}> = ({ syncCamera, viewId, eventEmitterRef }) => {
  const [modelGltf, setModelGltf] = useState<GLTF | null>(null);
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
      let target = new Vector3();
      cameraControlsRef.current.getTarget(target);
      sharedCameraParams.target.copy(target);
      sharedCameraParams.position.copy(cameraControlsRef.current.camera.position);
      sharedCameraParams.quaternion.copy(cameraControlsRef.current.camera.quaternion);
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
    eventEmitterRef.current.on('loadGltf', ({ modelBlob }) => {
      console.log('loadGltf event received in CustomOrbitControls');
      const gltfLoader = new GLTFLoader(MANAGER)
        .setCrossOrigin('anonymous')
        .setDRACOLoader(DRACO_LOADER)
        .setKTX2Loader(KTX2_LOADER)
        .setMeshoptDecoder(MeshoptDecoder);
      gltfLoader.parse(modelBlob.buffer, '',
          (gltf) => {
            console.log('OK parse');
            setModelGltf(gltf);
          },
          (error) => {
              console.log(`failed parse: ${error}`);
          }
      );
    });
    eventEmitterRef.current.on('recenterModel', () => {
      if (!modelGltf) {
        console.log('No model loaded, cannot recenter');
        return;
      }
      console.log('recenter called');
      const box = new Box3().setFromObject(modelGltf.scene);
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
    if (camera instanceof OrthographicCamera && cameraControlsRef.current && cameraControlsRef.current.active) {
      saveCameraState();
    } else if (syncCamera && cameraControlsRef.current) {
      const { position, target, zoom, quaternion } = sharedCameraParams;
      // まずCameraControls側から更新関数を呼び出す。updateは呼ばない
      // cameraControlsRef.current.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true);

      cameraControlsRef.current.camera.position.copy(position);
      cameraControlsRef.current.camera.quaternion.copy(quaternion);
      cameraControlsRef.current.camera.zoom = zoom;
      cameraControlsRef.current.camera.updateProjectionMatrix();

      // 描画の滑らかさのため、cameraControlsの内部状態も更新
    }
  });

  return (
    <Canvas
      style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
      // frameloop='demand'
      dpr={[1, 1.5]}
      orthographic
    >
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
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[10, 10, 10]} />
      {modelGltf != null && <Center><primitive object={modelGltf.scene} /></Center>}
    </Canvas>
  );
};

export default CustomOrbitControls;
