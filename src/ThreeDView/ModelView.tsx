import { FC, useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { Canvas, invalidate } from '@react-three/fiber';
import { CameraControls, Center } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, Sphere, LoadingManager, REVISION } from 'three';
import * as THREE from 'three';
import { GLTF, GLTFLoader, DRACOLoader, KTX2Loader } from 'three/addons';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from './ThreeDViewEvent';
import { CameraSyncEvent } from './CameraEvent';
import { ThreeEvent } from '@react-three/fiber'

const MANAGER = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
	`${THREE_PATH}/examples/jsm/libs/draco/gltf/`,
);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
	`${THREE_PATH}/examples/jsm/libs/basis/`,
);

const DRAG_PIXEL_TOLERANCE = 2; // pixels, ドラッグとクリックを区別する閾値

function parseBlobAsGLTF(modelBlob: Uint8Array<ArrayBuffer>): Promise<GLTF> {
  const gltfLoader = new GLTFLoader(MANAGER)
    .setCrossOrigin('anonymous')
    .setDRACOLoader(DRACO_LOADER)
    .setKTX2Loader(KTX2_LOADER)
    .setMeshoptDecoder(MeshoptDecoder);
    
  return new Promise((resolve, reject) => {
    gltfLoader.parse(
      modelBlob.buffer,
      '',
      (gltf) => resolve(gltf),
      (error) => reject(error)
    );
  });
}

function recenterCameraToModel(cameraControl: CameraControls, modelGltf: GLTF) {
  const box = new Box3().setFromObject(modelGltf.scene);
  const boundingSphere = new Sphere();
  box.getBoundingSphere(boundingSphere);  // ボックスからスフィアを計算
  cameraControl.fitToSphere(boundingSphere, true); // スフィアにフィットさせる
}

// OrbitControls which supports syncronization of cameras between multi canvases.
const ModelView: FC<{
  syncCamera: boolean;
  viewId: string;
  viewOperationEventEmitter: RefObject<Emitter<ThreeDViewEvent>>;
  cameraSyncEventEmitter: RefObject<Emitter<CameraSyncEvent>>;
}> = ({ syncCamera, viewId, viewOperationEventEmitter, cameraSyncEventEmitter }) => {
  const isSynkingCamera = useRef(false);
  const [modelGltf, setModelGltf] = useState<GLTF | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);

  const handleOnChange = useCallback(() => {
    // 「他からの同期中」でなければ、自分が Master としてイベントを発信
    if (syncCamera && !isSynkingCamera.current && cameraControlsRef.current && cameraControlsRef.current.active) {
      // console.log(`Emitting syncCamera event from ModelView ${viewId}`);
      let target = new Vector3();
      cameraControlsRef.current.getTarget(target);

      const camera = cameraControlsRef.current.camera as OrthographicCamera;
      cameraSyncEventEmitter.current.emit('syncCamera', {
        masterViewId: viewId,
        position: camera.position.clone(),
        target: target,
        zoom: camera.zoom,
      });
    }
  }, [syncCamera, cameraControlsRef, cameraSyncEventEmitter, viewId]);

  const syncCameraEventHandler = useCallback(({ masterViewId, position, target, zoom }: CameraSyncEvent['syncCamera']) => {
    // console.log(`Received syncCamera event in ModelView ${viewId}`);
    if (!cameraControlsRef.current) {
      // console.log('cameraControlsRef is null');
      return;
    }
    if (masterViewId == viewId) {
      // 自分が発信したイベントは無視
      return;
    }
    if (!syncCamera) {
      // 同期オフの場合は無視
      return;
    }
    // カメラの状態を更新する前に、同期フラグをオフにして、無限ループを防止
    isSynkingCamera.current = true;

    // cameraControlsの内部状態も更新
    cameraControlsRef.current.normalizeRotations().setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, false);
    cameraControlsRef.current.normalizeRotations().zoomTo(zoom, false);

    // 再描画を要求して、カメラの変更を反映
    invalidate();

    // カメラの状態を更新した後に、同期フラグをオンにする
    isSynkingCamera.current = false;
  }, [syncCamera, viewId]);

  useEffect(() => {
    // add event listeners
    viewOperationEventEmitter.current.on('loadGltf', ({ modelBlob }) => {
      console.log('loadGltf event received in ModelView');
      parseBlobAsGLTF(modelBlob).then((gltf) => {
        // 全てのメッシュの境界ボリュームを計算
        // gltf.scene.traverse((child) => {
        //   if ((child as THREE.Mesh).isMesh) {
        //     child.raycast = THREE.Mesh.prototype.raycast; // ついでにraycast関数も保証
        //     (child as THREE.Mesh).geometry.computeBoundingBox();
        //     (child as THREE.Mesh).geometry.computeBoundingSphere();
        //   }
        // });
        setModelGltf(gltf);
        console.log('GLTF loaded and parsed successfully');
      }).catch((error) => {
        console.error('Error loading GLTF:', error);
      });
    });
    viewOperationEventEmitter.current.on('recenterModel', () => {
      if (!modelGltf) {
        console.log('No model loaded, cannot recenter');
        return;
      }
      if (cameraControlsRef.current) {
        recenterCameraToModel(cameraControlsRef.current, modelGltf);
      }
    });
    cameraSyncEventEmitter.current.on('syncCamera', syncCameraEventHandler);

    return () => {
      viewOperationEventEmitter.current.off('recenterModel');
      cameraSyncEventEmitter.current.off('syncCamera', syncCameraEventHandler);
    };
  }, [modelGltf, viewOperationEventEmitter, cameraSyncEventEmitter, syncCamera, viewId]);

  useEffect(() => {
    if (cameraControlsRef.current && modelGltf) {
        recenterCameraToModel(cameraControlsRef.current, modelGltf);
      }
  }, [modelGltf]);

  return (
    <Canvas
      style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
      // frameloop='demand'
      dpr={[1, 1.5]}
      onPointerMissed={() => console.log("Canvasは反応してるが、モデルには当たってない")}
      orthographic
    >
      <CameraControls
        ref={cameraControlsRef}
        onChange={handleOnChange}
        smoothTime={0}           // 回転・ズームの慣性
        draggingSmoothTime={0}   // ドラッグ（パン）の慣性
        makeDefault
      />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[10, 10, 10]} />
      <axesHelper args={[5]}/>
      {modelGltf != null && <Center><primitive
        object={modelGltf.scene}
        raycast={THREE.Mesh.prototype.raycast}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          // 1. 他の重なっているオブジェクトを貫通しないようにする
          event.stopPropagation();

          // 2. 面の情報を取得（event.face, event.faceIndex など）
          // console.log("Clicked Face Index:", event.faceIndex);
          // console.log("Clicked Object Name:", event.object.name); // どのパーツか
          // ドラッグしていないときだけ、クリックイベントとして処理
          if (event.delta < DRAG_PIXEL_TOLERANCE) {
            console.log(event);
          }
        }}
      /></Center>}
    </Canvas>
  );
};

export default ModelView;
