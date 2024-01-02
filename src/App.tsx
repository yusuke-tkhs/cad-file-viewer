import React, { useState, FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { Flex, Text, Button, Grid, Box, Container, Section, Card, TextArea, Switch, RadioGroup, Separator } from '@radix-ui/themes';
import * as Menubar from '@radix-ui/react-menubar';
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from '@radix-ui/react-icons';
import './MenuBar.css';

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

const VIEW_LAYOUT_KINDS = ['One', 'TwoSplits', 'ThreeSplits','FourSplits'];
const App: FC = () => {
  const [viewLayoutRadioSelection, setViewLayoutRadioSelection] = React.useState(VIEW_LAYOUT_KINDS[0]);
  const [linksCameraPerspective, setLinksCameraPerspective] = React.useState(false);

  return (
    <Box position='fixed' width='100%' top='0' bottom='0'>
      {
        // MenuBarはRadix primitive. ThemeのPopUpとかを使ってメニューは実装し直したほうがいいかもしれない
      }
      {
        // radio button の動作例など
      }
      <RadioGroup.Root defaultValue="1" onValueChange={(e)=>console.log(e)}>
      <Flex gap="2" direction="column">
        <Text as="label" size="2">
          <Flex gap="2">
            <RadioGroup.Item value="1" /> Default
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex gap="2">
            <RadioGroup.Item value="2" /> Comfortable
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex gap="2">
            <RadioGroup.Item value="3" /> Compact
          </Flex>
        </Text>
      </Flex>
    </RadioGroup.Root>
    <Separator my="2" size="2" />
      <Menubar.Root className='MenubarRoot'>
        <Menubar.Menu>
          <Menubar.Trigger className='MenubarTrigger'>Window</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className='MenubarContent' align='start' sideOffset={5} alignOffset={-3}>
              <Menubar.RadioGroup value={viewLayoutRadioSelection} onValueChange={setViewLayoutRadioSelection}>
                {VIEW_LAYOUT_KINDS.map((item) => (
                  <Menubar.RadioItem className='MenubarRadioItem inset' key={item} value={item}>
                    <Menubar.ItemIndicator className='MenubarItemIndicator'>
                      <DotFilledIcon />
                    </Menubar.ItemIndicator>
                    {item}
                  </Menubar.RadioItem>
                ))}
              </Menubar.RadioGroup>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger className='MenubarTrigger'>View</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className='MenubarContent' align='start' sideOffset={5} alignOffset={-3}>
              <Menubar.CheckboxItem
                  className='MenubarCheckboxItem inset'
                  checked={linksCameraPerspective}
                  onCheckedChange={() => {
                    if(linksCameraPerspective){
                      console.log(`linksCameraPerspective: ${linksCameraPerspective}`)
                    }
                    setLinksCameraPerspective(!linksCameraPerspective);
                  }
                    
                  }
                >
                  <Menubar.ItemIndicator className='MenubarItemIndicator'>
                    <CheckIcon />
                  </Menubar.ItemIndicator>
                  Links camera perspecrive
                </Menubar.CheckboxItem>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
      <Flex gap='2' direction='row' width='100%' height='100%'>
        <Flex gap='2' direction='column' width='100%' height='100%'>
          <div style={{backgroundColor: 'green', width:'100%', height:'100%', borderColor:'red'}}><a color='black'>1</a></div>
          <div style={{backgroundColor: 'blue', width:'100%', height:'100%', borderColor:'blue'}}><a color='black'>2</a></div>
        </Flex>
        <Flex gap='2' direction='column' width='100%' height='100%'>
          <div style={{backgroundColor: 'orange', width:'100%', height:'100%', borderColor:'blue'}}><a color='black'>3</a></div>
          <div style={{backgroundColor: 'gray', width:'100%', height:'100%', borderColor:'blue'}}><a color='black'>4</a></div>
        </Flex>
      </Flex>
    </Box>
  );
};

export default App;
