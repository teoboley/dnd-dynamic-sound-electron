import styled from 'styled-components';
import colors from '../../../shared/colors';
import Slider from '../../../atoms/slider';
import Icon from '../../../atoms/icon';

export interface ISoundContainerProps {
  active: boolean;
}

export const SoundContainer = styled.div<ISoundContainerProps>(props => ({
  backgroundColor: props.active ? colors.primary : colors.inactive,
  color: 'black',
  display: 'flex',
  justifyContent: 'space-between'
}));

export const Contents = styled.div({
  position: 'relative',
  width: 120,
  minHeight: 150,
  padding: 5,
  zIndex: 0
});

export const SoundHeader = styled.button({
  display: 'block',
  cursor: 'pointer',
  marginBottom: 5,
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
  fontSize: 'inherit',
  textAlign: 'left',
  color: 'inherit',
  '&:focus, &:active': {
    color: 'inherit'
  }
});

export const StyledIcon = styled(Icon)({
  fontSize: 22,
  color: 'inherit',
  margin: '4px 6px 4px 4px',
  verticalAlign: 'bottom'
});

export const SoundTitle = styled.h6({
  display: 'inline-block',
  margin: '0 0 10px 0',
  verticalAlign: 'middle'
});

export const SoundSections = styled.div({
  fontSize: 12
});

export const ReverbSliderWrapper = styled.div({
  marginLeft: 10,
  marginRight: 10
});

export const VolumeSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: 12,
  width: 40,
  marginLeft: 5,
  padding: 8,
  backgroundColor: 'rgba(0, 0, 0, 0.075)'
});

export const VolumeSlider = styled(Slider)({
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: 5,
  minHeight: 75
});
