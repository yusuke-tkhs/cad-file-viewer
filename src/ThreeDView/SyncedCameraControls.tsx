import { FC, useRef, useCallback, useEffect, RefObject } from 'react';
import { invalidate } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { OrthographicCamera, Box3, Vector3, Sphere } from 'three';
import mitt, {Emitter} from 'mitt';
import { CameraSyncEvent } from './CameraEvent';
import { GLTF } from 'three/addons';

// すべてのビューでの視点連動を管理するためのイベント送受信を担当するオブジェクト。
const cameraSyncEventEmitter = mitt<CameraSyncEvent>();

function recenterCameraToModel(cameraControl: CameraControls, modelGltf: GLTF) {
  const box = new Box3().setFromObject(modelGltf.scene);
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
  modelGltf: GLTF | null;
  cameraOperationEmitter: RefObject<Emitter<CameraOperationEvent>>;
}> = ({
  syncCamera,
  viewId, // カメラコントロールが配置されるビューの一意な識別子
  modelGltf,
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
    if (modelGltf  && controlsRef.current) {
      recenterCameraToModel(controlsRef.current, modelGltf);
    }
  }, [modelGltf]);

  // イベントの購読とクリーンアップ
  useEffect(() => {
    cameraSyncEventEmitter.on('syncCamera', handleSyncCamera);
    return () => {
      cameraSyncEventEmitter.off('syncCamera', handleSyncCamera);
    };
  }, [cameraSyncEventEmitter, handleSyncCamera]);
  useEffect(() => {
    cameraOperationEmitter.current.on('recenterModel', () => {
    if (controlsRef.current && modelGltf) {
      recenterCameraToModel(controlsRef.current, modelGltf);
    }
  });
    return () => {
      cameraOperationEmitter.current.off('recenterModel');
    };
  }, [controlsRef, modelGltf]);

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
