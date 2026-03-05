import { FC, useState, useEffect, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Emitter } from 'mitt';
import { invalidate, ThreeEvent } from '@react-three/fiber'

const DRAG_PIXEL_TOLERANCE = 2; // pixels, ドラッグとクリックを区別する閾値

// emissive プロパティを持つ代表的なマテリアルの型を定義
type EmissiveMaterial = THREE.MeshStandardMaterial | THREE.MeshPhongMaterial | THREE.MeshPhysicalMaterial | THREE.MeshLambertMaterial;
function isEmissiveMaterial(mat: THREE.Material): mat is EmissiveMaterial {
  // THREE.jsのマテリアルが持つフラグプロパティで判定
  return (
    'isMeshStandardMaterial' in mat || 
    'isMeshPhongMaterial' in mat || 
    'isMeshPhysicalMaterial' in mat || 
    'isMeshLambertMaterial' in mat
  );
}

export type ModelManageEvent = {
  loadGltf: {
    modelBlob: Uint8Array<ArrayBuffer>
  },
  select: {
    uuid: string,
    isShift: boolean,
  },
  resetSelection: void,
};


// 個別のモデルを描画するコンポーネント
// url: GLTFのオブジェクトURL. createObjectURLで生成された一時的なURLを想定
function SingleModel({ url, selectedIds, modelManageEmitter }: { url: string, selectedIds: Set<string>, modelManageEmitter: Emitter<ModelManageEvent> }) {
  const { scene } = useGLTF(url);

  // 描画のたびに色を更新
  scene.traverse((obj: THREE.Object3D<THREE.Object3DEventMap>) => {
    // console.log("traversed");
    if (obj.type == "Mesh") {
      if (!obj.userData.isMaterialCloned) {
        let material = (obj as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material = material.map(m => m.clone());
        } else {
          material = material.clone();
        }
        obj.userData.isMaterialCloned = true; // クローン済みフラグを立てる
      }
      
      const isSelected = selectedIds.has(obj.uuid);
      // 選択中は赤、未選択は白（または元の色）
      const material = (obj as THREE.Mesh).material;
      const materials = Array.isArray(material) ? material : [material];
      materials.forEach((mat: THREE.Material)=>{
        if (isEmissiveMaterial(mat)) {
          if (isSelected) {
            mat.emissive.set('red');
            mat.emissiveIntensity = 1.0;
          } else {
            mat.emissive.set('black');
            mat.emissiveIntensity = 0;
          }
        }
      });
    }
  })

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

      // 2. ドラッグしていないときだけ、クリックイベントとして処理
      if (event.delta < DRAG_PIXEL_TOLERANCE) {
        console.log(event.object);
        console.log("Clicked Name:", event.object.name); 
        modelManageEmitter.emit('select', {
          uuid: event.object.uuid,
          isShift: event.shiftKey,
        });
      }
    }}
  />;
}

type ModelItem = {
  id: string; // 削除や管理用の一意なID
  url: string; // createObjectURL で作ったURL
}

interface ModelManagerProps {
  groupRef: React.RefObject<THREE.Group | null>;
  modelManageEmitter: React.RefObject<Emitter<ModelManageEvent>>;
}

export const ModelManager: FC<ModelManagerProps> = ({ 
  groupRef, 
  modelManageEmitter 
}) => {
  const [models, setModels] = useState<ModelItem[]>([]);
  // 選択中のUUIDを管理するSet（重複を防ぎ、検索が速い）
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleLoadGltf = useCallback(({ modelBlob }: { modelBlob: Uint8Array<ArrayBuffer> }) => {
    const url = URL.createObjectURL(new Blob([modelBlob]));
    setModels(prev => [...prev, { id: crypto.randomUUID(), url }]);
  }, []);

  const handleSelect = useCallback(({uuid, isShift}: {uuid: string, isShift: boolean}) => {
    console.log("handleSelect Called");
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (isShift) {
        // Shift押下：トグル（あれば消す、なければ足す）
        if (next.has(uuid)) {
          next.delete(uuid)
        } else {
          next.add(uuid)
        }
      } else {
        // Shiftなし：単一選択（それ以外を全部消す）
        next.clear()
        next.add(uuid)
      }
      return next
    })
  }, [])

  const resetSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    if (!modelManageEmitter.current) return;

    // 購読開始
    modelManageEmitter.current.on('loadGltf', handleLoadGltf);
    modelManageEmitter.current.on('select', handleSelect);
    modelManageEmitter.current.on('resetSelection', resetSelection);

    // クリーンアップ：コンポーネントが消える時に購読を解除（二重登録防止）
    return () => {
      modelManageEmitter.current.off('loadGltf');
      modelManageEmitter.current.off('select');
      modelManageEmitter.current.off('resetSelection');
    };
  }, [handleLoadGltf, handleSelect, resetSelection, modelManageEmitter]);

  return (
    <group ref={groupRef}>
      {models.map((model) => (
        <SingleModel key={model.id} url={model.url} selectedIds={selectedIds} modelManageEmitter={modelManageEmitter.current} />
      ))}
    </group>
  );
};