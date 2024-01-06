import React, { FC } from 'react';
import { Flex, Button, Grid, Box, DropdownMenu } from '@radix-ui/themes';

import ThreeDView from './ThreeDView';
import ThreeDViewMenuBar from './ThreeDViewMenuBar';
import range from './utility';

const App: FC = () => {
  const [rowNumberOfViewDivision, serRowNumberOfViewDivision] = React.useState(1);
  const [colNumberOfViewDivision, setColNumberOfViewDivision] = React.useState(1);
  const numberOfViews = rowNumberOfViewDivision * colNumberOfViewDivision;
  const [syncCamera, setSyncCamera] = React.useState(false);

  return (
    <Flex direction='column' position='fixed' width='100%' top='0' bottom='0' gap='2'>
      {/* application menu bar */}
      <Flex gap='2' align='start' direction='row'>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Box width='6'>
              <Button variant='ghost'>File</Button>
            </Box>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {numberOfViews == 1 ? (
              <DropdownMenu.Item onClick={() => console.log('aaaa')}> OpenFile </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>Open file in</DropdownMenu.SubTrigger>

                <DropdownMenu.SubContent>
                  {range(1, numberOfViews).map((view_id, index) => (
                    <DropdownMenu.Item key={index}>View {view_id}</DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            )}
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>Screen shot</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Save to file (unimplemented)</DropdownMenu.Item>
                <DropdownMenu.Item>Copy to Clipboard (unimplemented)</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant='ghost'>View</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onClick={() => {
                serRowNumberOfViewDivision(1);
                setColNumberOfViewDivision(1);
              }}
            >
              Single view
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                serRowNumberOfViewDivision(1);
                setColNumberOfViewDivision(2);
              }}
            >
              Double views (1 row * 2 col)
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                serRowNumberOfViewDivision(2);
                setColNumberOfViewDivision(2);
              }}
            >
              Four views (2 row * 2 col)
            </DropdownMenu.Item>
            <DropdownMenu.Item>Custom division...</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.CheckboxItem
              checked={syncCamera}
              onClick={() => setSyncCamera(!syncCamera)}
            >
              Link perspective of cameras
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
      {/* View layolut */}
      <Grid
        gap='1'
        rows={rowNumberOfViewDivision.toString()}
        columns={colNumberOfViewDivision.toString()}
        width='100%'
        height='100%'
        top='auto'
        grow='1'
      >
        {range(0, rowNumberOfViewDivision * colNumberOfViewDivision - 1).map((index) => (
          <ThreeDView
            key={index}
            syncCamera={syncCamera}
            toolBar={(meshRef) => <ThreeDViewMenuBar meshRef={meshRef} />}
          />
        ))}
      </Grid>
    </Flex>
  );
};

export default App;
