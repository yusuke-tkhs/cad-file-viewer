import { atom } from 'recoil';
import {DEFAULT_CAMERA} from './defaultCamera'

export const sharedCameraState = atom({
  key: 'sharedCameraState',
  default: DEFAULT_CAMERA,
});
