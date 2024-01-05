// 一度作ったが没にしたタブ付きビュー
import React, { FC, ReactNode } from 'react';
import { Flex, Button, Box, Tabs } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import range from './utility';

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

export default TabView;
