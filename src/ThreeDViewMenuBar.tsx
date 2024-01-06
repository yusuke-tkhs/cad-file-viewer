import { FC, memo } from 'react';
import { Flex, Button } from '@radix-ui/themes';

const ThreeDViewMenuBar: FC<{
  onRecenterButtonClicked: () => void;
}> = memo(({ onRecenterButtonClicked }) => {
  return (
    <Flex direction='column' style={{ width: '100%', height: '30px' }}>
      <Button onClick={onRecenterButtonClicked} style={{ width: '80px', height: '25px' }}>
        Recenter
      </Button>
    </Flex>
  );
});

export default ThreeDViewMenuBar;
