import { Decibels } from 'tone/build/esm/core/type/Units';
import { IconProp as FontAwesomeIconProp } from '@fortawesome/fontawesome-svg-core';

export interface ISound {
  enabled: boolean;
  volume: Decibels;
  looping: boolean;
  loopInterval: number | null;
  reverb: number;
}

export type ISounds = {
  [id: string]: ISound;
};

export interface IBaseSoundSource {
  title?: string;
  iconName?: FontAwesomeIconProp;
  attribution?: string;
  defaultVolume?: number;
  defaultLooping?: boolean;
  defaultLoopInterval?: number;
  defaultReverb?: number;
}

export function isBaseSoundSource(
  possiblySoundSource: any
): possiblySoundSource is IBaseSoundSource {
  const assumedSoundSource = possiblySoundSource as IBaseSoundSource;
  // noinspection SuspiciousTypeOfGuard
  return (
    typeof assumedSoundSource === 'object' &&
    (assumedSoundSource.title !== undefined
      ? typeof assumedSoundSource.title === 'string'
      : true) &&
    (assumedSoundSource.attribution !== undefined
      ? typeof assumedSoundSource.attribution === 'string'
      : true) &&
    (assumedSoundSource.defaultVolume !== undefined
      ? typeof assumedSoundSource.defaultVolume === 'number'
      : true) &&
    (assumedSoundSource.defaultLooping !== undefined
      ? typeof assumedSoundSource.defaultLooping === 'boolean'
      : true) &&
    (assumedSoundSource.defaultLoopInterval !== undefined
      ? typeof assumedSoundSource.defaultLoopInterval === 'number'
      : true) &&
    (assumedSoundSource.defaultReverb !== undefined
      ? typeof assumedSoundSource.defaultReverb === 'number'
      : true)
  );
}

export interface ISoundSource extends IBaseSoundSource {
  audioData: ArrayBuffer;
}

export function isSoundSource(possiblySoundSource: any): possiblySoundSource is ISoundSource {
  const assumedSoundSource = possiblySoundSource as ISoundSource;
  // noinspection SuspiciousTypeOfGuard
  return (
    isBaseSoundSource(assumedSoundSource) &&
    assumedSoundSource.audioData !== undefined && typeof assumedSoundSource.audioData === 'object'
  );
}

export type ISoundSources = {
  [id: string]: ISoundSource;
};

export function isSoundSources(possiblySoundSources: any): possiblySoundSources is ISoundSources {
  const assumedSoundSources = possiblySoundSources as ISoundSources;
  return (
    typeof assumedSoundSources === 'object' &&
    Object.keys(assumedSoundSources).reduce<boolean>(
      (acc, soundId) => acc && isSoundSource(assumedSoundSources[soundId]),
      true
    )
  );
}

export interface ISceneSoundConfig {
  volume?: number;
  looping?: boolean;
  loopInterval?: number;
  reverb?: number;
}

export function isSceneSoundConfig(
  possiblySceneSoundConfig: any
): possiblySceneSoundConfig is ISceneSoundConfig {
  const assumedSceneSoundConfig = possiblySceneSoundConfig as ISceneSoundConfig;
  // noinspection SuspiciousTypeOfGuard
  return (
    typeof assumedSceneSoundConfig === 'object' &&
    (assumedSceneSoundConfig.volume !== undefined
      ? typeof assumedSceneSoundConfig.volume === 'number'
      : true) &&
    (assumedSceneSoundConfig.looping !== undefined
      ? typeof assumedSceneSoundConfig.looping === 'boolean'
      : true) &&
    (assumedSceneSoundConfig.loopInterval !== undefined
      ? typeof assumedSceneSoundConfig.loopInterval === 'number'
      : true) &&
    (assumedSceneSoundConfig.reverb !== undefined
      ? typeof assumedSceneSoundConfig.reverb === 'number'
      : true)
  );
}

export interface IScene {
  id: string;
  title?: string;
  sounds: {
    [id: string]: ISceneSoundConfig;
  };
}

export function isScene(possiblyScene: any): possiblyScene is IScene {
  const assumedScene = possiblyScene as IScene;
  // noinspection SuspiciousTypeOfGuard
  return (
    assumedScene.id !== undefined &&
    (assumedScene.title !== undefined ? typeof assumedScene.title === 'string' : true) &&
    assumedScene.sounds !== undefined &&
    typeof assumedScene.sounds === 'object' &&
    Object.keys(assumedScene.sounds).reduce<boolean>(
      (acc, soundId) => acc && isSceneSoundConfig(assumedScene.sounds[soundId]),
      true
    )
  );
}

export type IScenes = IScene[];

export function isScenes(possiblyScenes: any): possiblyScenes is IScenes {
  const assumedScenes = possiblyScenes as IScenes;
  return (
    typeof assumedScenes === 'object' &&
    assumedScenes.reduce<boolean>((acc, scene) => acc && isScene(scene), true)
  );
}

export interface ISceneSet {
  sources: ISoundSources;
  scenes: IScenes;
}

export function isSceneSet(possiblySceneSet: any): possiblySceneSet is ISceneSet {
  const assumedSceneSet = possiblySceneSet as ISceneSet;
  return (
    assumedSceneSet.scenes !== undefined &&
    isScenes(assumedSceneSet.scenes) &&
    assumedSceneSet.sources !== undefined &&
    isSoundSources(assumedSceneSet.sources) &&
    assumedSceneSet.scenes.reduce<boolean>(
      (acc, scene) => acc && hasNoMissingSoundsInSources(scene, assumedSceneSet.sources),
      true
    )
  );
}

export function hasNoMissingSoundsInSources(scene: IScene, sources: ISoundSources): boolean {
  return Object.keys(scene.sounds).reduce<boolean>(
    (acc, soundId) => acc && Object.keys(sources).includes(soundId),
    true
  );
}
