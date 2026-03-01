import { FC, memo, useRef, Suspense } from 'react';
import { Flex, Button, Tooltip, IconButton } from '@radix-ui/themes';
import {FileIcon} from '@radix-ui/react-icons'
import { MeshRefContent } from './meshRef';
import ModelCanvas from './OrbitControl/ModelCanvas';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { GLTF} from 'three/addons';

import mitt from 'mitt';
import { ThreeDViewEvent } from './ThreeDViewEvent';


const TOOLTIP_DURATION = 300;
const MENUBAR_HEIGHT = '30px';

// const GltfModel: FC<{modelBlob: Uint8Array, boundingSphereRef: MutableRefObject<ModelBoundingSphere | null>}> = ({modelBlob, boundingSphereRef}) => {
//   // const gltf = useLoader(GLTFLoader, URL.createObjectURL(new Blob([modelBlob],{ type: 'model/gltf-binary'})));
//   const gltf = useGLTF(URL.createObjectURL(new Blob([modelBlob],{ type: 'model/gltf-binary'})), true);
//   useEffect(()=>{
//     const scene = gltf.scene;

//     // バウンディングボックスを初期化
//     const bbox = new Box3().setFromObject(scene);

//     // バウンディングスフィアを計算
//     const boundingSphere = new Sphere();
//     bbox.getBoundingSphere(boundingSphere); 
//     boundingSphereRef.current = {
//       centerInWorld: scene.localToWorld(boundingSphere.center),
//       radius: boundingSphere.radius
//     };
//   },[gltf])
//   return <primitive object={gltf.scene} />;
// }

// type ModelBoundingSphere = {
//   centerInWorld: Vector3;
//   radius: number;
// }

function Loading() {
  return <h2>🌀 Loading...</h2>;
}

const ThreeDView: FC<{ syncCamera: boolean, viewId: string }> = memo(({ syncCamera, viewId }) => {
  const eventEmitter = useRef(mitt<ThreeDViewEvent>());
  return (
    <Flex direction='column'>
      {/* menu bar*/}
      <Flex direction='row' style={{ width: '100%', height: MENUBAR_HEIGHT}} gap='1'>
        <Tooltip content="Open file" delayDuration={TOOLTIP_DURATION}>
          <IconButton onClick={async ()=>{
            const filePath = await open({directory:false, multiple:false, filters: [{name: 'gltf', extensions:['glb']}]});
            const blob = new Uint8Array(await invoke('read_file_as_bytes', {path: filePath}));
            eventEmitter.current.emit('loadGltf', {
              modelBlob: blob
            });
          }}>
            <FileIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip content="Recenter model" delayDuration={TOOLTIP_DURATION}>
          <Button onClick={() => eventEmitter.current.emit('recenterModel')} style={{ width: MENUBAR_HEIGHT, height: MENUBAR_HEIGHT }}>
            <img src='/recenterIcon.png' style={{height:'100%'}}/>
          </Button>
        </Tooltip>
      </Flex>
      {/* TODO: このCanvas要素以下をファイル分けしてモデルビューとして独立させる */}
      <Suspense fallback={<Loading/>}>
          <ModelCanvas syncCamera={syncCamera} viewId={viewId} eventEmitterRef={eventEmitter} />
      </Suspense>
    </Flex>
  );
});

export default ThreeDView;
