import { Mesh, BufferGeometry, NormalBufferAttributes, Material, Object3DEventMap } from 'three';

export type MeshRefContent = Mesh<
  BufferGeometry<NormalBufferAttributes>,
  Material | Material[],
  Object3DEventMap
>;
export type MeshRef = React.RefObject<MeshRefContent> | undefined;
