import { OrthographicCamera } from 'three';

const WIDTH = 1980;
const HEIGHT = 1080;
export const DEFAULT_CAMERA = new OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 10000);
