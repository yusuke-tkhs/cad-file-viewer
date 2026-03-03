import { FC, useRef, useState, useEffect, useCallback, RefObject, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, Html, useGLTF, useProgress } from '@react-three/drei';
import { LoadingManager, REVISION } from 'three';
import * as THREE from 'three';
import { GLTF, GLTFLoader, DRACOLoader, KTX2Loader } from 'three/addons';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { Emitter } from 'mitt';
import { ThreeDViewEvent } from './ThreeDViewEvent';
import { SyncedCameraControls } from './SyncedCameraControls';
import { ThreeEvent } from '@react-three/fiber'
import { CameraOperationEvent } from './SyncedCameraControls';
import { color } from 'three/tsl';

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

// function Loading() {
//   return (
//     <Html center>
//       <h2 style={{color: "black"}}>open model...</h2>
//     </Html>
//   )
// }

// function Loader() {
//   const { progress } = useProgress() // 読み込み進捗率 (0-100)
//   return (
//     <Html center>
//       {/* ここは普通の HTML/CSS が使えます */}
//       <div style={{ 
//         background: 'rgba(0,0,0,0.8)', 
//         color: 'white', 
//         padding: '10px 20px', 
//         borderRadius: '20px',
//         whiteSpace: 'nowrap'
//       }}>
//         読み込み中... {progress.toFixed(0)}%
//       </div>
//     </Html>
//   )
// }

// // 個別のモデルを描画するコンポーネント
// function SingleModel({ url }: { url: string }) {
//   const { scene } = useGLTF(url)
//   // 必要に応じて、読み込み後に固有の ID を userData から取得して処理
//   return <primitive object={scene} />
// }

// export function ModelManager() {
//   const [modelUrls, setModelUrls] = useState<string[]>([])

//   // Emitter などからモデル追加イベントを受けた時の処理
//   const addModel = (blob: Blob) => {
//     const url = URL.createObjectURL(blob)
//     setModelUrls((prev) => [...prev, url])
//   }

//   return (
//     <Suspense fallback={<Loader />}>
//       {modelUrls.map((url) => (
//         <SingleModel key={url} url={url} />
//       ))}
//     </Suspense>
//   )
// }

const ModelView: FC<{
  syncCamera: boolean;
  viewId: string;
  viewOperationEventEmitter: RefObject<Emitter<ThreeDViewEvent>>;
  cameraOperationEmitter: RefObject<Emitter<CameraOperationEvent>>;
}> = ({ syncCamera, viewId, viewOperationEventEmitter, cameraOperationEmitter: cameraOperationEmitter }) => {
  const [modelGltf, setModelGltf] = useState<GLTF | null>(null);

  const handleLoadGltf = useCallback(({modelBlob}: {modelBlob: Uint8Array<ArrayBuffer>}) => {
    parseBlobAsGLTF(modelBlob).then((gltf) => {
      setModelGltf(gltf);
    }).catch((error) => {
      console.error('Error loading GLTF:', error);
    });
  }, []);

  useEffect(() => {
    // add event listeners
    viewOperationEventEmitter.current.on('loadGltf', handleLoadGltf);

    return () => {
      viewOperationEventEmitter.current.off('loadGltf', handleLoadGltf);
    };
  }, [modelGltf, viewOperationEventEmitter, syncCamera, viewId]);

  return (
    <Canvas
      style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
      // frameloop='demand'
      dpr={[1, 1.5]}
      onPointerMissed={() => console.log("Canvasは反応してるが、モデルには当たってない")}
      orthographic
    >
      <SyncedCameraControls syncCamera={syncCamera} viewId={viewId} modelGltf={modelGltf} cameraOperationEmitter={cameraOperationEmitter} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[10, 10, 10]} />
      <axesHelper args={[5]}/>
      {
        modelGltf != null &&
          <Center><primitive
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
          /></Center>
      }
    </Canvas>
  );
};

export default ModelView;
