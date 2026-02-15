import { atom } from 'recoil';
import { Vector3 } from 'three';
export const sharedZoomState = atom<number | null>({
  key: 'sharedZoomState',
  default: null,
});