import { Vector3 } from 'three';

// Record<event name, event argument type>
// Event type for communicating between canvas or its chidren and other components
export type ThreeDViewEvent = {
  recenterModel: {
    cameraLookAt: Vector3;
    cameraDistance: number;
  };
};
