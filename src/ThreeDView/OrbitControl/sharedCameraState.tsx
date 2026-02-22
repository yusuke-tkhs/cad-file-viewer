import { atom } from 'recoil';
import { Vector3 } from 'three';

// export const sharedCameraState = atom<{ position: Vector3; target: Vector3, zoom: number } | null>({
//   key: 'sharedCameraState',
//   default: null,
// });

export const sharedCameraState = atom<{ position: Vector3; target: Vector3, zoom: number } | null>({
  key: 'sharedCameraState',
  default: null,
});

// export const sharedCameraState = atom<{ position: Vector3; target: Vector3 } | null>({
//   key: 'sharedCameraState',
//   default: null,
// });
