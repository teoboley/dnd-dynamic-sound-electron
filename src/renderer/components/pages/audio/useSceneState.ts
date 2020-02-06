import React from 'react';
import { IScenes, ISound, ISounds, ISoundSources } from './types';
import produce from 'immer';

export const SCRATCH_SCENE_ID = '--scratch--';

interface IInternalSoundStateRegistry {
  [sceneId: string]: ISounds;
}

export interface IResolvedSceneStates {
  [sceneId: string]: ISounds;
}

interface IUseSceneStateHookResult {
  scenes: IResolvedSceneStates;
  setSoundEnabled(sceneId: string, soundId: string, muted: boolean): void;
  setSoundVolume(sceneId: string, soundId: string, volume: number): void;
  setSoundLooping(sceneId: string, soundId: string, looping: boolean): void;
  setSoundLoopInterval(sceneId: string, soundId: string, loopInterval: number | null): void;
  setSoundReverb(sceneId: string, soundId: string, reverb: number): void;
}

// FIXME: this needs to return a representation of the state for all scenes (for thumbnails)
function useSceneState(soundSources: ISoundSources, scenes: IScenes): IUseSceneStateHookResult {
  const [internalSoundStateRegistry, setInternalSoundStateRegistry] = React.useState<
    IInternalSoundStateRegistry
  >({
    [SCRATCH_SCENE_ID]: Object.keys(soundSources).reduce<ISounds>((sounds, sourceId) => {
      const soundSource = soundSources[sourceId];

      return {
        ...sounds,
        [sourceId]: {
          enabled: false,
          volume: soundSource.defaultVolume || 0,
          looping: soundSource.defaultLooping || false,
          loopInterval: soundSource.defaultLoopInterval || null,
          reverb: soundSource.defaultReverb || 0
        }
      };
    }, {}),
    ...scenes.reduce((soundRegistry, scene) => {
      return {
        ...soundRegistry,
        [scene.id]: Object.keys(soundSources).reduce<ISounds>((sounds, sourceId) => {
          const soundSource = soundSources[sourceId];
          const soundConfig = scene.sounds[sourceId];

          return {
            ...sounds,
            [sourceId]: {
              enabled: Boolean(soundConfig),
              volume: soundConfig?.volume || soundSource.defaultVolume || 0,
              looping: soundConfig?.looping || soundSource.defaultLooping || false,
              loopInterval: soundConfig?.loopInterval || soundSource.defaultLoopInterval || null,
              reverb: soundConfig?.reverb || soundSource.defaultReverb || 0
            }
          };
        }, {})
      };
    }, {})
  });

  const setStateForSound = (sceneId: string, soundId: string, cb: (soundState: ISound) => void) => {
    setInternalSoundStateRegistry(old =>
      produce(old, draft => {
        const soundState = draft[sceneId][soundId];
        cb(soundState);
      })
    );
  };

  return {
    scenes: internalSoundStateRegistry,
    setSoundLoopInterval(sceneId: string, soundId: string, loopInterval: number | null): void {
      setStateForSound(sceneId, soundId, soundState => {
        soundState.loopInterval = loopInterval;
      });
    },
    setSoundLooping(sceneId: string, soundId: string, looping: boolean): void {
      setStateForSound(sceneId, soundId, soundState => {
        soundState.looping = looping;
      });
    },
    setSoundEnabled(sceneId: string, soundId: string, enabled: boolean): void {
      setStateForSound(sceneId, soundId, soundState => {
        soundState.enabled = enabled;
      });
    },
    setSoundVolume(sceneId: string, soundId: string, volume: number): void {
      setStateForSound(sceneId, soundId, soundState => {
        soundState.volume = volume;
      });
    },
    setSoundReverb(sceneId: string, soundId: string, reverb: number): void {
      setStateForSound(sceneId, soundId, soundState => {
        soundState.reverb = reverb;
      });
    }
  };
}

export default useSceneState;
