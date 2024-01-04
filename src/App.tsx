import React, { FC, ReactNode } from 'react';
import {
  Flex,
  Text,
  Button,
  Grid,
  Box,
  Container,
  Section,
  Card,
  TextArea,
  Switch,
  RadioGroup,
  Separator,
  DropdownMenu,
  Tabs,
} from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';

import ThreeDView from './threeDView';

const TabView: FC<{ viewIndex: number; children: ReactNode }> = ({ viewIndex, children }) => {
  const [numberOfTabs, setNumberOfTabs] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState(1);
  return (
    <Box width='100%' height='100%' grow='1'>
      <Tabs.Root
        defaultValue='1'
        onValueChange={(value) => {
          console.log('Tabs.Root onValueChange');
          console.log(value);
          setActiveTab(parseInt(value));
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Flex width='100%' height='100%' direction='column' gap='1'>
          <Box width='100%' height='7'>
            <Tabs.List>
              {numberOfTabs > 0 ? (
                range(1, numberOfTabs).map((tabIndex) => (
                  <Tabs.Trigger key={tabIndex} value={tabIndex.toString()}>
                    Tab {viewIndex}_{tabIndex}
                  </Tabs.Trigger>
                ))
              ) : (
                <></>
              )}
              <Box pt='2' pl='2'>
                <Button
                  size='1'
                  onClick={() => {
                    setNumberOfTabs(numberOfTabs + 1);
                  }}
                >
                  <PlusIcon />
                </Button>
              </Box>
            </Tabs.List>
          </Box>

          <Box px='1' pt='2' pb='1' width='100%' height='100%'>
            {numberOfTabs > 0 ? (
              range(1, numberOfTabs).map((tabIndex) => (
                <Tabs.Content
                  value={tabIndex.toString()}
                  // active タブのときだけ表示、かつ常にマウントし続ける（unmountしない）ことで、
                  // タブを切り替えても３次元ビューの視点がリセットされないようにする
                  hidden={activeTab !== tabIndex}
                  forceMount={true}
                  style={{ width: '100%', height: '90%' }}
                >
                  {children}
                </Tabs.Content>
              ))
            ) : (
              <></>
            )}
          </Box>
        </Flex>
      </Tabs.Root>
    </Box>
  );
};

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, k) => k + start);

const App: FC = () => {
  const [rowNumberOfViewDivision, serRowNumberOfViewDivision] = React.useState(1);
  const [colNumberOfViewDivision, setColNumberOfViewDivision] = React.useState(1);
  const numberOfViews = rowNumberOfViewDivision * colNumberOfViewDivision;
  const [linksCameraPerspective, setLinksCameraPerspective] = React.useState(false);

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
              checked={linksCameraPerspective}
              onClick={() => setLinksCameraPerspective(!linksCameraPerspective)}
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
          <TabView key={index} viewIndex={index}>
            <ThreeDView />
          </TabView>
        ))}
      </Grid>
    </Flex>
  );
};

export default App;
