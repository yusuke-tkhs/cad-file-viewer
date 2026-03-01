import { Vector3, Quaternion } from 'three';

// Record<event name, event argument type>
// Event type for communicating between canvas or its chidren and other components
export type CameraSyncEvent = {
  syncCamera: {
    masterViewId: string;
    position: Vector3;
    target: Vector3;
    // quaternion: Quaternion;
    zoom: number;
  };
};
