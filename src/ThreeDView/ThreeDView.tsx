import { FC, memo, useRef } from 'react';
import { Flex, Button, Tooltip, IconButton } from '@radix-ui/themes';
import {FileIcon} from '@radix-ui/react-icons'
import ModelView from './ModelView';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

import mitt from 'mitt';
import { ModelManageEvent } from './ModelManager';
import { CameraOperationEvent } from './SyncedCameraControls';


const TOOLTIP_DURATION = 300;
const MENUBAR_HEIGHT = '30px';

const ThreeDView: FC<{ syncCamera: boolean, viewId: string }> = memo(({ syncCamera, viewId }) => {
  const modelManageEmitter = useRef(mitt<ModelManageEvent>());
  const cameraOperationEmitter = useRef(mitt<CameraOperationEvent>());
  return (
    <Flex direction='column'>
      {/* menu bar*/}
      <Flex direction='row' style={{ width: '100%', height: MENUBAR_HEIGHT}} gap='1'>
        <Tooltip content="Open file" delayDuration={TOOLTIP_DURATION}>
          <IconButton onClick={async ()=>{
            const filePath = await open({directory:false, multiple:false, filters: [{name: 'gltf', extensions:['glb']}]});
            const blob = new Uint8Array(await invoke('read_file_as_bytes', {path: filePath}));
            modelManageEmitter.current.emit('loadGltf', {
              modelBlob: blob
            });
          }}>
            <FileIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip content="Recenter model" delayDuration={TOOLTIP_DURATION}>
          <Button onClick={() => cameraOperationEmitter.current.emit('recenterModel')} style={{ width: MENUBAR_HEIGHT, height: MENUBAR_HEIGHT }}>
            <img src='/recenterIcon.png' style={{height:'100%'}}/>
          </Button>
        </Tooltip>
      </Flex>
      <ModelView syncCamera={syncCamera} viewId={viewId} modelManageEmitter={modelManageEmitter} cameraOperationEmitter={cameraOperationEmitter} />
    </Flex>
  );
});

export default ThreeDView;
