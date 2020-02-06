import styled from 'styled-components';
import colors from '../../shared/colors';
import Icon from '../../atoms/icon';

export const FileIcon = styled(Icon)({
  fontSize: 35
});

interface IDragDropZoneProps {
  isDragActive: boolean;
}

export const DragDropZone = styled.div<IDragDropZoneProps>(props => ({
  backgroundColor: props.isDragActive ? colors.primary : 'rgba(0, 0, 0, 0.1)',
  color: props.isDragActive ? 'black' : undefined,
  height: 300,
  maxWidth: 400,
  margin: '40px auto 0 auto',
  display: 'flex',
  textAlign: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 40,
  cursor: 'pointer'
}));
