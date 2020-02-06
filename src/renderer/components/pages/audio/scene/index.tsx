import React from 'react';
import { ISounds } from '../types';
import { MiniSound, SceneContainer, SceneSounds, SceneSoundsWrapper, SceneTitle } from './styles';

interface ISceneViewModel {
  id: string;
  title?: string;
  sounds: ISounds;
  active: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface ISceneActions {
  onSelect?(): void;
}

export type ISceneProps = ISceneViewModel & ISceneActions;

const Scene: React.FC<ISceneProps> = props => {
  const title = props.title || props.id;
  return (
    <SceneContainer
      title={title}
      active={props.active}
      selectable={Boolean(props.onSelect)}
      onClick={props.onSelect}
      className={props.className}
      style={props.style}
    >
      <SceneSoundsWrapper>
        <SceneSounds>
          {Object.keys(props.sounds).map(soundId => {
            const sound = props.sounds[soundId];
            return <MiniSound key={soundId} active={sound.enabled} volume={sound.volume} />;
          })}
        </SceneSounds>
      </SceneSoundsWrapper>
      <SceneTitle>{title}</SceneTitle>
    </SceneContainer>
  );
};

export default Scene;
