import React from 'react';
import styled from 'styled-components';
import colors from '../shared/colors';

const InputContainer = styled.label({
  display: 'inline-block',
  position: 'relative',
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'middle',
  margin: 4,
  minHeight: 20,
  minWidth: 20,
  backgroundColor: colors.background
});

const Checkmark = styled.span({
  display: 'block',
  position: 'absolute',
  top: 4,
  left: 4,
  right: 4,
  bottom: 4,
  backgroundColor: colors.inactive
});

const StyledInput = styled.input({
  position: 'absolute',
  opacity: 0,
  cursor: 'pointer',
  height: 0,
  width: 0,
  [`&:checked ~ ${Checkmark}`]: {
    backgroundColor: colors.inputPrimary
  }
});

interface ICheckboxViewModel {
  id?: string;
  checked: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface ICheckboxActions {
  onToggle?(value: boolean): void;
}

export type ICheckboxProps = ICheckboxViewModel & ICheckboxActions;

const Checkbox: React.FC<ICheckboxProps> = props => {
  return (
    <InputContainer className={props.className} style={props.style}>
      <StyledInput
        type="checkbox"
        id={props.id}
        checked={props.checked}
        onChange={props.onToggle && (({ target: { checked } }) => props.onToggle!(checked))}
      />
      <Checkmark />
    </InputContainer>
  );
};

export default Checkbox;
