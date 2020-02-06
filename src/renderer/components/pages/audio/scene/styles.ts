import styled from 'styled-components';
import colors from '../../../shared/colors';
import { VOLUME_MAX, VOLUME_MIN } from '../sound';
import { convertRange } from '../../../shared/utils';

interface ISceneContainerProps {
  active: boolean;
  selectable: boolean;
}

export const SceneContainer = styled.div<ISceneContainerProps>(props => ({
  display: 'inline-block',
  width: 100,
  zIndex: 1,
  cursor: props.selectable ? 'pointer' : undefined,
  padding: 3,
  backgroundColor: props.active ? colors.primary : undefined,
  color: props.active ? 'black' : undefined,
  '&:hover': {
    backgroundColor: colors.primary,
    color: 'black'
  }
}));

export const SceneSoundsWrapper = styled.div({
  width: '100%',
  height: 80,
  backgroundColor: colors.inactive,
  padding: 10,
  overflowY: 'hidden'
});

export const SceneSounds = styled.div({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap'
});

export interface IMiniSoundProps {
  active: boolean;
  volume: number;
}

export const MiniSound = styled.div<IMiniSoundProps>(props => ({
  position: 'relative',
  width: 7.5,
  height: 7.5,
  margin: 2.5,
  backgroundColor: colors.background,
  '&:after': {
    content: "''",
    position: 'absolute',
    top: `${convertRange(props.volume, [VOLUME_MIN, VOLUME_MAX], [90, 0])}%`,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: props.active ? colors.primary : 'transparent'
  }
}));

export const SceneTitle = styled.h6({
  width: '100%',
  margin: '3px 0',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
});
