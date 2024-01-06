import { atom } from 'recoil';
import { OrthographicCamera } from 'three';

const WIDTH = 1980;
const HEIGHT = 1080;

export const sharedCameraState = atom({
  key: 'sharedCameraState',
  default: new OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000),
});
