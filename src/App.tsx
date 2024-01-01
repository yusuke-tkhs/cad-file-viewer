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

const App: FC = () => {
  // const [selectedMenu, setSelectedMenu] = useState<string>('');
  const menus = ['Window', '3D View'];

  const [openMenuMap, setOpenMenuMap] = useState<Map<String, boolean>>(
    new Map(menus.map((m) => [m, false])),
  );

  return (
    <Flex direction='column' gap='2'>
      <Text>Hello from Radix Themes :)</Text>
      <Button>Let's go</Button>
    </Flex>
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
