import { atom } from 'recoil';
import { Vector3, Quaternion } from 'three';
import { create } from "zustand"

/**
 * タブの状態を管理するストア
 */
export interface CameraState {
  position: Vector3;
  target: Vector3;
  quaternion: Quaternion;
  zoom: number;
  changeCameraState: (position: Vector3, target: Vector3, quaternion: Quaternion, zoom: number) => void;
}
/**
 * カメラ状態管理ストア
 */
export const useCameraStore = create<CameraState>((set) => ({
  position: new Vector3(0, 0, 0),
  target: new Vector3(0, 0, 0),
  quaternion: new Quaternion(0, 0, 0, 1),
  zoom: 1,

  changeCameraState: (position: Vector3, target: Vector3, quaternion: Quaternion, zoom: number) =>
    set({
      position,
      target,
      quaternion,
      zoom
    }),
}))

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
