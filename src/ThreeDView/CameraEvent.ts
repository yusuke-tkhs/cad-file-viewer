import { Vector3, Scene, Group, Quaternion, Object3DEventMap } from 'three';

// Record<event name, event argument type>
// Event type for communicating between canvas or its chidren and other components
export type ThreeDViewEvent = {
  recenterModel: {
    scene: Group<Object3DEventMap>;
  };
  syncCamera: {
    position: Vector3;
    target: Vector3;
    quaternion: Quaternion;
    zoom: number;
  };
};
