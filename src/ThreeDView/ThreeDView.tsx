import { FC, memo, useRef, Suspense, RefObject } from 'react';
import { Flex, Button, Tooltip, IconButton } from '@radix-ui/themes';
import {FileIcon} from '@radix-ui/react-icons'
import ModelView from './OrbitControl/ModelView';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

import mitt, { Emitter } from 'mitt';
import { ThreeDViewEvent } from './ThreeDViewEvent';
import { CameraSyncEvent } from './CameraEvent';


const TOOLTIP_DURATION = 300;
const MENUBAR_HEIGHT = '30px';

function Loading() {
  return <h2>🌀 Loading...</h2>;
}

const ThreeDView: FC<{ syncCamera: boolean, viewId: string, cameraSyncEventEmitter: RefObject<Emitter<CameraSyncEvent>> }> = memo(({ syncCamera, viewId, cameraSyncEventEmitter }) => {
  const viewOperationEventEmitter = useRef(mitt<ThreeDViewEvent>());
  return (
    <Flex direction='column'>
      {/* menu bar*/}
      <Flex direction='row' style={{ width: '100%', height: MENUBAR_HEIGHT}} gap='1'>
        <Tooltip content="Open file" delayDuration={TOOLTIP_DURATION}>
          <IconButton onClick={async ()=>{
            const filePath = await open({directory:false, multiple:false, filters: [{name: 'gltf', extensions:['glb']}]});
            const blob = new Uint8Array(await invoke('read_file_as_bytes', {path: filePath}));
            viewOperationEventEmitter.current.emit('loadGltf', {
              modelBlob: blob
            });
          }}>
            <FileIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip content="Recenter model" delayDuration={TOOLTIP_DURATION}>
          <Button onClick={() => viewOperationEventEmitter.current.emit('recenterModel')} style={{ width: MENUBAR_HEIGHT, height: MENUBAR_HEIGHT }}>
            <img src='/recenterIcon.png' style={{height:'100%'}}/>
          </Button>
        </Tooltip>
      </Flex>
      {/* TODO: このCanvas要素以下をファイル分けしてモデルビューとして独立させる */}
      <Suspense fallback={<Loading/>}>
          <ModelView syncCamera={syncCamera} viewId={viewId} viewOperationEventEmitter={viewOperationEventEmitter} cameraSyncEventEmitter={cameraSyncEventEmitter} />
      </Suspense>
    </Flex>
  );
});

export default ThreeDView;
