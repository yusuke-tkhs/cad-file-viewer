// import { FC, memo. useRef } from 'react';
// import { Canvas, useThree, useFrame } from '@react-three/fiber';
// import { Edges, Box, OrbitControls } from '@react-three/drei';

// const SharedOrbitControls = ({ enabled }) => {
//     const {
//       camera,
//       gl: { domElement },
//     } = useThree();
//     const controls = useRef();

//     useFrame(() => {
//       if (enabled) {
//         controls.current.update();
//       }
//     });

//     return <OrbitControls ref={controls} camera= enabled={enabled} />;
//   };

// import React, { FC, useRef, useState, useEffect } from 'react';
// import { Canvas, useFrame, extend, useThree, ReactThreeFiber } from '@react-three/fiber';
// import { OrbitControls } from 'three/addons';
// // import { CameraControls } from '@react-three/drei';

// extend({ OrbitControls });

// // TypeScriptの型定義を拡張
// declare global {
//     namespace JSX {
//       interface IntrinsicElements {
//         orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
//       }
//     }
//   }

// const SharedOrbitControls: FC<{enabled: boolean}> = ({ enabled }) => {
//   const {
//     camera,
//     gl: { domElement },
//   } = useThree();
//   const controls = useRef<OrbitControls>(null);

//   useFrame(() => {
//     if (enabled && controls?.current != null) {
//       controls.current.update();
//     }
//   });

//   return <orbitControls ref={controls} args={[camera, domElement]} enabled={enabled} enableDamping={true} dampingFactor={0.2} />;
// };

import React, { FC, useRef, useState, useEffect, MutableRefObject } from 'react';
import { Canvas, useFrame, extend, useThree, ReactThreeFiber } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Euler, Quaternion, Vector3, OrthographicCamera as ThreeOrthographicCamera } from 'three';
import { OrbitControls as ThreeOrbitControl } from 'three/addons';

extend({ OrbitControls });

export interface CameraState {
  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  zoom: number;
  //camera: ThreeOrthographicCamera
}

// const cameraProps = {
  //   left: -5,
  //   right: 5,
  //   top: 5,
  //   bottom: -5,
  //   near: -20,
  //   far: 100,
  // };

export const defaultCameraState: CameraState = {
  position: new Vector3(0, 0, 5),
  rotation: new Euler(0, 0, 0, 'XYZ'),
  quaternion: new Quaternion(1, 1, 1, 1),
  zoom: 1
};

// export const defaultCameraState: CameraState = {
//   camera: new ThreeOrthographicCamera(
//     -5,5,5,-5,-20,100
//   )
// };


const SharedOrbitControls: FC<{
  cameraState: CameraState;
  updateCameraStateFn: (cameraState: CameraState) => void;
  enabled: boolean;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}> = ({ cameraState, updateCameraStateFn, enabled, canvasRef }) => {
  const [operating, setOperating] = useState(false);
  const { camera, gl:{domElement} } = useThree();

  useEffect(() => {
    // const onDragStart = () => {
    //   setOperating(true);
    // };
    // const onDrag = () => {
    //   console.log('ondrag!!!!');
    //   updateCameraStateFn(camera);
    // };
    // const onDragEnd = () => {
    //   setOperating(false);
    // };
    if(!(camera instanceof ThreeOrthographicCamera)){return;}
    const onScroll = () => {
      console.log('onScroll');
      console.log(cameraState.zoom);
      setOperating(true);
      updateCameraStateFn({
        position: camera.position,
        rotation: camera.rotation,
        quaternion: camera.quaternion,
        zoom: camera.zoom + 0.1,
      });
    };
    const onScrollEnd = () => {
      console.log('onScrollEnd')
      setOperating(false);
    };
    console.log('use effect!!!');
    console.log('event listeners');
    // domElement.addEventListener('dragstart', onDragStart);
    // domElement.addEventListener('drag', onDrag);
    // domElement.addEventListener('dragend', onDragEnd);
    domElement.addEventListener('wheel', onScroll);
    domElement.addEventListener('scrollend', onScrollEnd);
    return () => {
      if (canvasRef.current) {
        // domElement.removeEventListener('dragstart', onDragStart);
        // domElement.removeEventListener('drag', onDrag);
        // domElement.removeEventListener('dragend', onDragEnd);
        domElement.removeEventListener('scroll', onScroll);
        domElement.removeEventListener('scrollend', onScrollEnd);
      }
    };
  });

  useFrame(() => {
    if (enabled && !operating) {
      const { position, quaternion, rotation, zoom } = cameraState;
      camera.position.set(position.x, position.y, position.z);
      camera.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      camera.rotation.set(rotation.x, rotation.y, rotation.z);
      camera.zoom = zoom
      camera.updateProjectionMatrix();
      camera.updateWorldMatrix(true, true);
      camera.updateMatrixWorld(true);
      // if(camera instanceof ThreeOrthographicCamera){
        
      //   if(cameraState.camera !== undefined){
          
      //     // console.log(cameraState.camera);
      //     camera.left = cameraState.camera.left;
      //     camera.right = cameraState.camera.right;
      //     camera.top = cameraState.camera.top;
      //     camera.bottom = cameraState.camera.bottom;
      //     camera.near = cameraState.camera.near;
      //     camera.far = cameraState.camera.far;
      //     camera.updateMatrix();
      //     camera.updateProjectionMatrix();
      //     camera.   
      //   }
        
      // }     
        
    }
  });

  return (
    <OrbitControls
      domElement={domElement}
      onStart={(e) => {
        console.log(e);
        setOperating(true);
        if(camera instanceof ThreeOrthographicCamera){
          updateCameraStateFn({
            position: camera.position,
            rotation: camera.rotation,
            quaternion: camera.quaternion,
            zoom: camera.zoom,
          })
        }
      }}
      onEnd={(e) => {
        setOperating(false);
      }}
      onChange={(e)=>{
        if(e && operating){
          const camera = e.target.object;
          if(camera instanceof ThreeOrthographicCamera){
            updateCameraStateFn({
              position: camera.position,
              rotation: camera.rotation,
              quaternion: camera.quaternion,
              zoom: camera.zoom,
              //camera: camera.clone()
            })
          }
        }
      }}
      camera={camera}
      enableDamping={true}
      // enableZoom={false}
      dampingFactor={0.2}
    />
  );
};

export default SharedOrbitControls;
