import { atom } from 'recoil';
import { OrthographicCamera, Vector3 } from 'three';

export const sharedCameraState = atom<{ camera: OrthographicCamera; target: Vector3 } | null>({
  key: 'sharedCameraState',
  default: null,
});
