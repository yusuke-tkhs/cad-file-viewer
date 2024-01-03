import React, { useState, FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
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
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
  CaretDownIcon,
  PlusIcon,
} from '@radix-ui/react-icons';

interface ThreeDViewProps {
  isActive: boolean;
}

const ThreeDView: FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <Canvas>
      {/* 立方体のレンダリング */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial attach='material' color='orange' />
      </mesh>
    </Canvas>
  );
};

const TabWindow: FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  return (
    <div>
      <div>{/* タブの切り替えボタン */}</div>
      <ThreeDView isActive={activeTab === 0} />
      {/* 他のタブも同様に追加 */}
    </div>
  );
};

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, k) => k + start);

const App: FC = () => {
  const [rowNumberOfViewDivision, serRowNumberOfViewDivision] = React.useState(1);
  const [colNumberOfViewDivision, setColNumberOfViewDivision] = React.useState(1);
  const numberOfViews = rowNumberOfViewDivision * colNumberOfViewDivision;
  const [linksCameraPerspective, setLinksCameraPerspective] = React.useState(false);
  // dummy
  const [numberOfTabs, setNumberOfTabs] = React.useState(1);
  const [activeTab, setActiveTabs] = React.useState(1);

  return (
    <Flex direction='column' position='fixed' width='100%' top='0' bottom='0'>
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
      {
        /* View layolut */
        // タブに＋ボタンをどうやって出せばいいのかわからない
      }
      <Flex gap='2' direction='column' width='100%' height='100%'>
        {range(0, rowNumberOfViewDivision - 1).map((rowIndex) => (
          <Flex key={rowIndex} gap='2' direction='row' width='100%' height='100%'>
            {
              // view port mock
              range(0, colNumberOfViewDivision - 1).map((colIndex) => {
                const view_id = rowIndex * colNumberOfViewDivision + colIndex + 1;
                return (
                  <Box key={colIndex} width='100%' height='100%'>
                    <Tabs.Root defaultValue='1'>
                      <Tabs.List>
                        {numberOfTabs > 0 ? (
                          range(1, numberOfTabs).map((tabIndex) => (
                            <Tabs.Trigger key={tabIndex} value={tabIndex.toString()}>
                              Tab {tabIndex}
                            </Tabs.Trigger>
                          ))
                        ) : (
                          <></>
                        )}
                        <Tabs.Trigger value='new' onClick={() => {
                              setNumberOfTabs(numberOfTabs + 1);
                            }}
                        >
                          <PlusIcon
                            
                          />
                        </Tabs.Trigger>
                      </Tabs.List>

                      <Box px='4' pt='3' pb='2' width='100%' height='100%'>
                        {numberOfTabs > 0 ? (
                          range(1, numberOfTabs).map((tabIndex) => (
                            <Tabs.Content value={tabIndex.toString()}>
                              <div
                                key={tabIndex}
                                style={{ backgroundColor: 'gray', width: '100%', height: '100%' }}
                              >
                                {view_id}
                              </div>
                            </Tabs.Content>
                          ))
                        ) : (
                          <></>
                        )}
                      </Box>
                    </Tabs.Root>
                  </Box>
                );
              })
            }
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default App;
