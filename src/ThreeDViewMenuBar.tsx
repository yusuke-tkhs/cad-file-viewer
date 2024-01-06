import { FC, memo, ReactNode, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Flex, Button, Grid, Box, DropdownMenu } from '@radix-ui/themes';
import { OrthographicCamera } from 'three';
import { MeshRef } from './meshRef';

const ThreeDViewMenuBar: FC<{
  enableCameraSync?: boolean;
  onUpdateSharedCamera?: (camera: OrthographicCamera) => void;
  onRecenterModel?: () => void;
  meshRef: MeshRef;
  // camera 参照も必要
}> = memo(({ onRecenterModel, meshRef }) => {
  return (
    <Flex direction='column' style={{ width: '100%', height: '30px' }}>
      <Button
        onClick={() => {
          if (meshRef?.current) {
            const geomCenter = meshRef.current.geometry.center;
          }
        }}
        style={{ width: '80px', height: '25px' }}
      >
        {' '}
        Recenter{' '}
      </Button>
    </Flex>
  );
});

export default ThreeDViewMenuBar;
