import React from 'react';
import {
  SoundGrid,
  Container,
  PlayerButton,
  SceneList,
  StyledScene,
  StyledSound,
  TopBar,
  ErrorMessage,
  SoundGridWrapper,
  ControlList
} from './styles';
import { ISceneSet } from './types';
import useSceneState, { SCRATCH_SCENE_ID } from './useSceneState';
import Icon, { EIconName } from '../../atoms/icon';
import { useFileHandlingHelper } from '../../shared/file-handling';
import { usePlayer, EPlaybackStatus } from './player';

interface IAudioViewModel {
  sceneSet: ISceneSet;
  selectedSceneId: string;
}

interface IAudioActions {
  onSceneSelected?(sceneId: string): void;
  onNewSceneSetLoaded?(sceneSet: ISceneSet): void;
}

export type IAudioProps = IAudioViewModel & IAudioActions;

const Audio: React.FC<IAudioProps> = props => {
  const { sources: soundSources, scenes: baseScenes } = props.sceneSet;
  const {
    scenes: sceneStates,
    setSoundEnabled,
    setSoundVolume,
    setSoundLooping,
    setSoundLoopInterval,
    setSoundReverb
  } = useSceneState(soundSources, baseScenes);
  const currentSceneState = sceneStates[props.selectedSceneId];
  const audio = usePlayer(soundSources, currentSceneState, props.selectedSceneId, 5);

  const fileHandlingHelper = useFileHandlingHelper();

  return (
    <Container>
      <TopBar>
        <ControlList>
          <PlayerButton
            disabled={!audio.loaded || audio.playbackStatus === EPlaybackStatus.Started}
            onClick={audio.start}
          >
            <Icon name={EIconName.Play} />
          </PlayerButton>
          <PlayerButton
            disabled={!audio.loaded || audio.playbackStatus !== EPlaybackStatus.Started}
            onClick={audio.pause}
          >
            <Icon name={EIconName.Pause} />
          </PlayerButton>
          <PlayerButton
            disabled={!audio.loaded || audio.playbackStatus === EPlaybackStatus.Stopped}
            onClick={audio.stop}
          >
            <Icon name={EIconName.Stop} />
          </PlayerButton>
          {props.onNewSceneSetLoaded && (
            <input
              type={'file'}
              accept={'application/json'}
              onChange={async ({ target: { files } }) => {
                if (files.length === 0) return;
                const newSceneSet = await fileHandlingHelper.loadSceneSet(files[0].path);
                props.onSceneSelected(SCRATCH_SCENE_ID);
                props.onNewSceneSetLoaded(newSceneSet);
              }}
            />
          )}
        </ControlList>
        <SceneList transitioningBetweenScenes={audio.isTransitioning}>
          {Object.keys(sceneStates).map(sceneId => {
            const sounds = sceneStates[sceneId];
            const baseScene = baseScenes.find(s => s.id === sceneId);

            return (
              <StyledScene
                key={sceneId}
                id={sceneId}
                title={baseScene?.title}
                active={props.selectedSceneId === sceneId}
                sounds={sounds}
                onSelect={props.onSceneSelected && (() => props.onSceneSelected!(sceneId))}
              />
            );
          })}
        </SceneList>
      </TopBar>
      <SoundGridWrapper>
        {audio.loadingError && <ErrorMessage>{audio.loadingError}</ErrorMessage>}
        <SoundGrid loaded={audio.loaded} loadErrored={Boolean(audio.loadingError)}>
          {Object.keys(currentSceneState).map(soundId => {
            const sound = currentSceneState[soundId];
            const { iconName, title } = soundSources[soundId];

            return (
              <StyledSound
                key={soundId}
                id={soundId}
                title={title}
                sound={sound}
                iconName={iconName}
                toggleEnabled={() =>
                  setSoundEnabled(props.selectedSceneId, soundId, !sound.enabled)
                }
                setVolume={newVolume => setSoundVolume(props.selectedSceneId, soundId, newVolume)}
                toggleLooping={() =>
                  setSoundLooping(props.selectedSceneId, soundId, !sound.looping)
                }
                setLoopingInterval={newInterval =>
                  setSoundLoopInterval(props.selectedSceneId, soundId, newInterval)
                }
                setReverb={newReverb => setSoundReverb(props.selectedSceneId, soundId, newReverb)}
              />
            );
          })}
        </SoundGrid>
      </SoundGridWrapper>
    </Container>
  );
};

export default Audio;
