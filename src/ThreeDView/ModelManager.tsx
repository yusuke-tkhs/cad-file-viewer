import { FC, useState, useEffect, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Emitter } from 'mitt';
import { ThreeEvent } from '@react-three/fiber'

const DRAG_PIXEL_TOLERANCE = 2; // pixels, ドラッグとクリックを区別する閾値

// 個別のモデルを描画するコンポーネント
// url: GLTFのオブジェクトURL. createObjectURLで生成された一時的なURLを想定
function SingleModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    // このコンポーネントがアンマウント（削除）された時に実行される
    return () => {
      console.log("Revoking URL:", url);
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return <primitive
    raycast={THREE.Mesh.prototype.raycast}
    object={scene}
    onClick={(event: ThreeEvent<MouseEvent>) => {
      // 1. 他の重なっているオブジェクトを貫通しないようにする
      event.stopPropagation();

      // 2. 面の情報を取得（event.face, event.faceIndex など）
      // console.log("Clicked Face Index:", event.faceIndex);
      // console.log("Clicked Object Name:", event.object.name); // どのパーツか
      // ドラッグしていないときだけ、クリックイベントとして処理
      if (event.delta < DRAG_PIXEL_TOLERANCE) {
        console.log(event);
      }
    }}
  />;
}

type ModelItem = {
  id: string; // 削除や管理用の一意なID
  url: string; // createObjectURL で作ったURL
}

export type ModelManageEvent = {
  loadGltf: {
    modelBlob: Uint8Array<ArrayBuffer>
  };
  // TODO: deleteも加える
};

interface ModelManagerProps {
  groupRef: React.RefObject<THREE.Group | null>;
  modelManageEmitter: React.RefObject<Emitter<ModelManageEvent>>;
}

export const ModelManager: FC<ModelManagerProps> = ({ 
  groupRef, 
  modelManageEmitter 
}) => {
  const [models, setModels] = useState<ModelItem[]>([]);

  const handleLoadGltf = useCallback(({ modelBlob }: { modelBlob: Uint8Array<ArrayBuffer> }) => {
    const url = URL.createObjectURL(new Blob([modelBlob]));
    setModels(prev => [...prev, { id: crypto.randomUUID(), url }]);
  }, []);

  useEffect(() => {
    if (!modelManageEmitter.current) return;

    // 購読開始
    modelManageEmitter.current.on('loadGltf', handleLoadGltf);

    // クリーンアップ：コンポーネントが消える時に購読を解除（二重登録防止）
    return () => {
      modelManageEmitter.current.off('loadGltf');
    };
  }, [handleLoadGltf, modelManageEmitter]);

  return (
    <group ref={groupRef}>
      {models.map((model) => (
        <SingleModel key={model.id} url={model.url} />
      ))}
    </group>
  );
};