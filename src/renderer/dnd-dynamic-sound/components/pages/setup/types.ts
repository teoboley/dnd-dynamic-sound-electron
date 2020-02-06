import { IBaseSoundSource, isBaseSoundSource, IScenes, isScenes } from '../audio/types';

export interface ISceneSetJSON {
  sources: {
    [soundId: string]: IBaseSoundSource & {
      audioFilename: string;
    };
  };
  scenes: IScenes;
}

export function isSceneSetJSON(possiblySceneSetJSON: any): possiblySceneSetJSON is ISceneSetJSON {
  const assumedSceneSetJSON = possiblySceneSetJSON as ISceneSetJSON;
  return (
    isScenes(assumedSceneSetJSON.scenes) &&
    Object.keys(assumedSceneSetJSON.sources).reduce<boolean>((acc, sourceId) => {
      const assumedSource = assumedSceneSetJSON.sources[sourceId] as ISceneSetJSON['sources'][0];
      // noinspection SuspiciousTypeOfGuard
      return (
        acc &&
        isBaseSoundSource(assumedSource) &&
        assumedSource.audioFilename !== undefined &&
        typeof assumedSource.audioFilename === 'string'
      );
    }, true)
  );
}
