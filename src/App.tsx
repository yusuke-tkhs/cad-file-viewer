// import { useState } from 'react';
// import reactLogo from './assets/react.svg';
// import { invoke } from '@tauri-apps/api/tauri';

// function App() {
//   const [greetMsg, setGreetMsg] = useState('');
//   const [name, setName] = useState('');

//   async function greet() {
//     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//     setGreetMsg(await invoke('greet', { name }));
//   }

//   return (
//     <div className='container'>
//       <h1>Welcome to Tauri!</h1>

//       <div className='row'>
//         <a href='https://vitejs.dev' target='_blank'>
//           <img src='/vite.svg' className='logo vite' alt='Vite logo' />
//         </a>
//         <a href='https://tauri.app' target='_blank'>
//           <img src='/tauri.svg' className='logo tauri' alt='Tauri logo' />
//         </a>
//         <a href='https://reactjs.org' target='_blank'>
//           <img src={reactLogo} className='logo react' alt='React logo' />
//         </a>
//       </div>

//       <p>Click on the Tauri, Vite, and React logos to learn more.</p>

//       <form
//         className='row'
//         onSubmit={(e) => {
//           e.preventDefault();
//           greet();
//         }}
//       >
//         <input
//           id='greet-input'
//           onChange={(e) => setName(e.currentTarget.value)}
//           placeholder='Enter a name...'
//         />
//         <button type='submit'>Greet</button>
//       </form>

//       <p>{greetMsg}</p>
//     </div>
//   );
// }

// export default App;

import React, { useState, FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { Flex, Text, Button } from '@radix-ui/themes';
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

const RADIO_ITEMS = ['Andy', 'Benoît', 'Luis'];
const CHECK_ITEMS = ['Always Show Bookmarks Bar', 'Always Show Full URLs'];

const MenubarDemo = () => {
  const [checkedSelection, setCheckedSelection] = React.useState([CHECK_ITEMS[1]]);
  const [radioSelection, setRadioSelection] = React.useState(RADIO_ITEMS[2]);

  return (
    <Menubar.Root className='MenubarRoot'>
      <Menubar.Menu>
        <Menubar.Trigger className='MenubarTrigger'>File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className='MenubarContent' align='start' sideOffset={5} alignOffset={-3}>
            <Menubar.Item className='MenubarItem'>
              New Tab <div className='RightSlot'>⌘ T</div>
            </Menubar.Item>
            <Menubar.Item className='MenubarItem'>
              New Window <div className='RightSlot'>⌘ N</div>
            </Menubar.Item>
            <Menubar.Item className='MenubarItem' disabled>
              New Incognito Window
            </Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Sub>
              <Menubar.SubTrigger className='MenubarSubTrigger'>
                Share
                <div className='RightSlot'>
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className='MenubarSubContent' alignOffset={-5}>
                  <Menubar.Item className='MenubarItem'>Email Link</Menubar.Item>
                  <Menubar.Item className='MenubarItem'>Messages</Menubar.Item>
                  <Menubar.Item className='MenubarItem'>Notes</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>
              Print… <div className='RightSlot'>⌘ P</div>
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className='MenubarTrigger'>Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className='MenubarContent' align='start' sideOffset={5} alignOffset={-3}>
            <Menubar.Item className='MenubarItem'>
              Undo <div className='RightSlot'>⌘ Z</div>
            </Menubar.Item>
            <Menubar.Item className='MenubarItem'>
              Redo <div className='RightSlot'>⇧ ⌘ Z</div>
            </Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Sub>
              <Menubar.SubTrigger className='MenubarSubTrigger'>
                Find
                <div className='RightSlot'>
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>

              <Menubar.Portal>
                <Menubar.SubContent className='MenubarSubContent' alignOffset={-5}>
                  <Menubar.Item className='MenubarItem'>Search the web…</Menubar.Item>
                  <Menubar.Separator className='MenubarSeparator' />
                  <Menubar.Item className='MenubarItem'>Find…</Menubar.Item>
                  <Menubar.Item className='MenubarItem'>Find Next</Menubar.Item>
                  <Menubar.Item className='MenubarItem'>Find Previous</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>Cut</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Copy</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Paste</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className='MenubarTrigger'>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='MenubarContent'
            align='start'
            sideOffset={5}
            alignOffset={-14}
          >
            {CHECK_ITEMS.map((item) => (
              <Menubar.CheckboxItem
                className='MenubarCheckboxItem inset'
                key={item}
                checked={checkedSelection.includes(item)}
                onCheckedChange={() =>
                  setCheckedSelection((current) =>
                    current.includes(item)
                      ? current.filter((el) => el !== item)
                      : current.concat(item),
                  )
                }
              >
                <Menubar.ItemIndicator className='MenubarItemIndicator'>
                  <CheckIcon />
                </Menubar.ItemIndicator>
                {item}
              </Menubar.CheckboxItem>
            ))}
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem inset'>
              Reload <div className='RightSlot'>⌘ R</div>
            </Menubar.Item>
            <Menubar.Item className='MenubarItem inset' disabled>
              Force Reload <div className='RightSlot'>⇧ ⌘ R</div>
            </Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem inset'>Toggle Fullscreen</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem inset'>Hide Sidebar</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className='MenubarTrigger'>Profiles</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='MenubarContent'
            align='start'
            sideOffset={5}
            alignOffset={-14}
          >
            <Menubar.RadioGroup value={radioSelection} onValueChange={setRadioSelection}>
              {RADIO_ITEMS.map((item) => (
                <Menubar.RadioItem className='MenubarRadioItem inset' key={item} value={item}>
                  <Menubar.ItemIndicator className='MenubarItemIndicator'>
                    <DotFilledIcon />
                  </Menubar.ItemIndicator>
                  {item}
                </Menubar.RadioItem>
              ))}
              <Menubar.Separator className='MenubarSeparator' />
              <Menubar.Item className='MenubarItem inset'>Edit…</Menubar.Item>
              <Menubar.Separator className='MenubarSeparator' />
              <Menubar.Item className='MenubarItem inset'>Add Profile…</Menubar.Item>
            </Menubar.RadioGroup>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
};

const App: FC = () => {
  // const [selectedMenu, setSelectedMenu] = useState<string>('');
  const menus = ['Window', '3D View'];

  const [openMenuMap, setOpenMenuMap] = useState<Map<String, boolean>>(
    new Map(menus.map((m) => [m, false])),
  );

  return (
    <>
      <MenubarDemo />
      <Flex direction='column' gap='2'>
        <Text>Hello from Radix Themes :)</Text>
        <Button>Let's go</Button>
      </Flex>
    </>
  );
};
// const App: FC = () => {
//   const [layout, setLayout] = useState<number>(1);
//   return (
//     <div>
//       <div data-tauri-drag-region className="titlebar">
//         <div className="titlebar-button" id="titlebar-minimize">
//           <img
//             src="https://api.iconify.design/mdi:window-minimize.svg"
//             alt="minimize"
//           />
//         </div>
//         <div className="titlebar-button" id="titlebar-maximize">
//           <img
//             src="https://api.iconify.design/mdi:window-maximize.svg"
//             alt="maximize"
//           />
//         </div>
//         <div className="titlebar-button" id="titlebar-close">
//           <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
//         </div>
//       </div>
//       <MenuBar onLayoutChange={setLayout} />
//       {Array.from({ length: layout }, (_, i) => (
//         <TabWindow key={i} />
//       ))}
//     </div>
//   );
// };

export default App;
