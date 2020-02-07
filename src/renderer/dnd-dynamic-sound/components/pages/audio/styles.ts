import styled from 'styled-components';
import Sound from './sound';
import Scene from './scene';
import colors from '../../shared/colors';

export const Container = styled.div({
  backgroundColor: colors.background
});

export const TopBar = styled.div({
  padding: 10,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  marginBottom: 10
});

export const ControlList = styled.div({
  display: 'flex'
});

export const PlayerButton = styled.button({
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
  color: 'white',
  cursor: 'pointer',
  fontSize: 18,
  marginRight: 5,
  '&:active': {
    opacity: 0.5
  },
  '&:disabled': {
    opacity: 0.25,
    cursor: 'not-allowed'
  }
});

export const SceneSetTitle = styled.h4({
  margin: 0
});

export interface ISceneListProps {
  transitioningBetweenScenes: boolean;
}

export const SceneList = styled.div<ISceneListProps>(props => ({
  margin: '10px 0',
  opacity: !props.transitioningBetweenScenes ? 1 : 0.25,
  '& > *': {
    pointerEvents: !props.transitioningBetweenScenes ? undefined : 'none'
  }
}));

export const StyledScene = styled(Scene)({
  margin: '0 5px'
});

export interface ISoundGridProps {
  loaded: boolean;
  loadErrored: boolean;
}

export const SoundGridWrapper = styled.div({
  position: 'relative'
});

export const SoundGrid = styled.div<ISoundGridProps>(props => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  opacity: props.loaded ? 1 : 0.25,
  cursor: props.loaded ? undefined : props.loadErrored ? 'not-allowed' : 'wait',
  '& > *': {
    pointerEvents: props.loaded ? undefined : 'none'
  }
}));

export const ErrorMessage = styled.div({
  position: 'absolute',
  top: 30,
  left: '50%',
  transform: 'translate(-50%, 0)',
  backgroundColor: colors.primary,
  color: 'black',
  padding: '10px 20px',
  zIndex: 2
});

export const StyledSound = styled(Sound)({
  margin: 10
});
