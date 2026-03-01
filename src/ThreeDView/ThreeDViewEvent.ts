export type ThreeDViewEvent = {
  loadGltf: {
    modelBlob: Uint8Array<ArrayBuffer>;
  }
  recenterModel: void;
};
