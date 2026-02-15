import { FC, memo, useRef, Suspense, useState, useEffect, MutableRefObject } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import { Flex, Button, Tooltip, IconButton } from '@radix-ui/themes';
import {FileIcon} from '@radix-ui/react-icons'
import { MeshRefContent } from './meshRef';
import CustomOrbitControls from './OrbitControl/CustomOrbitControls';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { GLTF, GLTFLoader, DRACOLoader, KTX2Loader } from 'three/addons';

import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import {Sphere, Box3, Vector3, LoadingManager, REVISION} from 'three';

import mitt from 'mitt';
import { ThreeDViewEvent } from './ThreeDViewEvent';


const TOOLTIP_DURATION = 300;
const MENUBAR_HEIGHT = '30px';

const MANAGER = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
	`${THREE_PATH}/examples/jsm/libs/draco/gltf/`,
);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
	`${THREE_PATH}/examples/jsm/libs/basis/`,
);


const GltfModel: FC<{modelBlob: Uint8Array, boundingSphereRef: MutableRefObject<ModelBoundingSphere | null>}> = ({modelBlob, boundingSphereRef}) => {
  // const gltf = useLoader(GLTFLoader, URL.createObjectURL(new Blob([modelBlob],{ type: 'model/gltf-binary'})));
  const gltf = useGLTF(URL.createObjectURL(new Blob([modelBlob],{ type: 'model/gltf-binary'})), true);
  useEffect(()=>{
    const scene = gltf.scene;

    // バウンディングボックスを初期化
    const bbox = new Box3().setFromObject(scene);

    // バウンディングスフィアを計算
    const boundingSphere = new Sphere();
    bbox.getBoundingSphere(boundingSphere); 
    boundingSphereRef.current = {
      centerInWorld: scene.localToWorld(boundingSphere.center),
      radius: boundingSphere.radius
    };
  },[gltf])
  return <primitive object={gltf.scene} />;
}

type ModelBoundingSphere = {
  centerInWorld: Vector3;
  radius: number;
}

const ThreeDView: FC<{ syncCamera: boolean }> = memo(({ syncCamera }) => {
  // const [modelBlob, setModelBlob] = useState<Uint8Array | null>(null);
  const [modelGltf, setModelGltf] = useState<GLTF | null>(null);
  const boundingSphereRef = useRef<ModelBoundingSphere | null>(null); // use for recenter camera to model
  const meshRef = useRef<MeshRefContent>(null);

  const eventEmitter = useRef(mitt<ThreeDViewEvent>());
  const recenterHandler = () => {
    if(!modelGltf){return;}
    eventEmitter.current.emit('recenterModel', {
      scene: modelGltf.scene
    });
  };

  useEffect(() => {
    if (modelGltf) {
      recenterHandler();
    }
  }, [modelGltf]);

  useEffect(() => {
    if (modelGltf) {
      recenterHandler();
    }
  }, [modelGltf]);

  return (
    <Flex direction='column'>
      {/* menu bar*/}
      <Flex direction='row' style={{ width: '100%', height: MENUBAR_HEIGHT}} gap='1'>
        <Tooltip content="Open file" delayDuration={TOOLTIP_DURATION}>
          <IconButton onClick={async ()=>{
            console.log('open start');
            const filePath = await open({directory:false, multiple:false, filters: [{name: 'gltf', extensions:['glb']}]});
            console.log('path get');
            const blob = new Uint8Array(await invoke('read_file_as_bytes', {path: filePath}));
            console.log('blob get');
            console.log(blob);
            const gltfLoader = new GLTFLoader(MANAGER)
              .setCrossOrigin('anonymous')
              .setDRACOLoader(DRACO_LOADER)
              .setKTX2Loader(KTX2_LOADER)
              .setMeshoptDecoder(MeshoptDecoder);
            console.log('start parse');
            
            gltfLoader.parse(blob.buffer, '',
                (gltf) => {
                  console.log('OK parse');
                  setModelGltf(gltf);
                  console.log(gltf);
                  
                },
                (error) => {
                    console.log('failed parse');
                    console.log(error);
                }
            );
          }}>
            <FileIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip content="Recenter model" delayDuration={TOOLTIP_DURATION}>
          <Button onClick={recenterHandler} style={{ width: MENUBAR_HEIGHT, height: MENUBAR_HEIGHT }}>
            <img src='/recenterIcon.png' style={{height:'100%'}}/>
          </Button>
        </Tooltip>
      </Flex>

      <Canvas
        style={{ background: 'white', width: '100%', height: '100%', flexGrow: 1 }}
        orthographic
      >
        <CustomOrbitControls syncCamera={syncCamera} eventEmitterRef={eventEmitter} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={<div>Loading...</div>}>
          {modelGltf != null && <Center><primitive object={modelGltf.scene} /></Center>}
        </Suspense>
      </Canvas>
    </Flex>
  );
});

export default ThreeDView;
