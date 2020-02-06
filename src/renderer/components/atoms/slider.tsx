import React from 'react';
import colors from '../shared/colors';
import RCSlider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface ISliderViewModel {
  value?: number;
  min?: number;
  max?: number;
  step?: number;

  vertical?: boolean;
  disabled?: boolean;

  className?: string;
  style?: React.CSSProperties;
}

interface ISliderActions {
  onChange?(newValue: number): void;
}

export type ISliderProps = ISliderViewModel & ISliderActions;

const Slider: React.FC<ISliderProps> = props => {
  return (
    <RCSlider
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      vertical={props.vertical}
      handleStyle={{
        height: 20,
        width: 20,
        marginLeft: props.vertical ? -8 : undefined,
        marginTop: props.vertical ? undefined : -8,
        backgroundColor: !props.disabled ? 'white' : colors.inactive,
        borderColor: colors.background,
        borderWidth: 3
      }}
      trackStyle={{
        backgroundColor: !props.disabled ? 'white' : colors.background
      }}
      railStyle={{
        backgroundColor: colors.background
      }}
      className={props.className}
      style={{
        ...(!props.vertical
          ? {
              marginTop: 7.5,
              marginBottom: 7.5
            }
          : {
              marginLeft: 7.5,
              marginRight: 7.5
            }),
        ...props.style
      }}
      onChange={props.onChange}
    />
  );
};

export default Slider;
