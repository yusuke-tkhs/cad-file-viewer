import { FC, useRef, useCallback, useEffect, RefObject } from 'react';
import { invalidate } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, Sphere } from 'three';
import mitt, {Emitter} from 'mitt';
import * as THREE from 'three';

// すべてのビューでの視点連動を管理するためのイベント送受信を担当するオブジェクト。
type CameraSyncEvent = {
  syncCamera: {
    masterViewId: string;
    position: Vector3;
    target: Vector3;
    zoom: number;
  };
};

const cameraSyncEventEmitter = mitt<CameraSyncEvent>();

function recenterCameraToModel(cameraControl: CameraControls, targetObjects: THREE.Group) {
  const box = new Box3().setFromObject(targetObjects);
  const boundingSphere = new Sphere();
  box.getBoundingSphere(boundingSphere);  // ボックスからスフィアを計算
  cameraControl.fitToSphere(boundingSphere, true); // スフィアにフィットさせる
}

export type CameraOperationEvent = {
  recenterModel: void;
};

export const SyncedCameraControls: FC<{
  syncCamera: boolean;
  viewId: string;
  targetObject: React.RefObject<THREE.Group | null>;
  cameraOperationEmitter: RefObject<Emitter<CameraOperationEvent>>;
}> = ({
  syncCamera,
  viewId, // カメラコントロールが配置されるビューの一意な識別子
  targetObject,
  cameraOperationEmitter,
}) => {
  const controlsRef = useRef<CameraControls>(null);
  const isSyncingInternal = useRef(false);

  // カメラ視点が動いた時のイベントハンドラ：ほかのビューのカメラに視点連動用の情報を送信
  const handleOnChange = useCallback(() => {
    if (syncCamera && !isSyncingInternal.current && controlsRef.current?.active) {
      const target = new Vector3();
      controlsRef.current.getTarget(target);
      const camera = controlsRef.current.camera as OrthographicCamera;

      cameraSyncEventEmitter.emit('syncCamera', {
        masterViewId: viewId,
        position: camera.position.clone(),
        target: target,
        zoom: camera.zoom,
      });
    }
  }, [syncCamera, viewId, cameraSyncEventEmitter]);

  // 他のビューから視点連動用のイベントを受信した時のハンドラ
  // 受信した情報をもとに自分のカメラの位置・ターゲット・ズームを更新
  const handleSyncCamera = useCallback(
    ({ masterViewId, position, target, zoom }: CameraSyncEvent['syncCamera']) => {
        // イベントが自分から発信されたもの、または連動OFFなら無視
        if (!controlsRef.current || masterViewId === viewId || !syncCamera) return;

        isSyncingInternal.current = true;
        
        // カメラ位置・ターゲット・ズームを即時反映（damp無し）
        controlsRef.current.setLookAt(
            position.x, position.y, position.z,
            target.x, target.y, target.z,
            false
        );
        controlsRef.current.zoomTo(zoom, false);

        invalidate(); // 描画更新
        isSyncingInternal.current = false;
    },
    [controlsRef, syncCamera, viewId]
  );

  // モデルがロードされたときに再中心化する
  useEffect(() => {
    if (targetObject.current  && controlsRef.current) {
      recenterCameraToModel(controlsRef.current, targetObject.current);
    }
  }, [targetObject]);

  // イベントの購読とクリーンアップ
  useEffect(() => {
    cameraSyncEventEmitter.on('syncCamera', handleSyncCamera);
    return () => {
      cameraSyncEventEmitter.off('syncCamera', handleSyncCamera);
    };
  }, [cameraSyncEventEmitter, handleSyncCamera]);
  useEffect(() => {
    cameraOperationEmitter.current.on('recenterModel', () => {
    if (controlsRef.current && targetObject.current) {
      recenterCameraToModel(controlsRef.current, targetObject.current);
    }
  });
    return () => {
      cameraOperationEmitter.current.off('recenterModel');
    };
  }, [controlsRef, targetObject, cameraOperationEmitter]);

  return (
    <CameraControls
      ref={controlsRef}
      onChange={handleOnChange}
      smoothTime={0}
      draggingSmoothTime={0}
      makeDefault
    />
  );
};
