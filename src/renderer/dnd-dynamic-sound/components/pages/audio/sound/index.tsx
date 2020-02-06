import React from 'react';
import {
  SoundContainer,
  SoundTitle,
  VolumeSection,
  SoundSections,
  SoundHeader,
  VolumeSlider,
  Contents,
  StyledIcon,
  ReverbSliderWrapper
} from './styles';
import { ISound } from '../types';
import Checkbox from '../../../atoms/checkbox';
import { IconProp as FontAwesomeIconProp } from '@fortawesome/fontawesome-svg-core';
import { EIconName } from '../../../atoms/icon';
import Slider from '../../../atoms/slider';

export const VOLUME_MIN = -30;
export const VOLUME_MAX = 30;

export enum ELoopInterval {
  FiveSec = 5,
  TenSec = 10,
  ThirtySec = 30,
  OneMin = 60,
  FiveMin = 5 * 60,
  TenMin = 10 * 60,
  FifteenMin = 15 * 60,
  ThirtyMin = 30 * 60
}

interface ISoundViewModel {
  id: string;
  title?: string;
  sound: ISound;
  iconName?: FontAwesomeIconProp;

  className?: string;
  style?: React.CSSProperties;
}

interface ISoundActions {
  toggleEnabled?(): void;
  setVolume?(value: number): void;
  toggleLooping?(): void;
  setLoopingInterval?(interval: number | null): void;
  setReverb?(value: number): void;
}

export type ISoundProps = ISoundViewModel & ISoundActions;

const Sound: React.FC<ISoundProps> = props => {
  const sound = props.sound;
  const title = props.title || props.id;

  return (
    <SoundContainer active={sound.enabled} className={props.className} style={props.style}>
      <Contents>
        <SoundHeader title={title} onClick={props.toggleEnabled && (() => props.toggleEnabled!())}>
          <StyledIcon name={EIconName.AudioSource} faIconOverride={props.iconName} />
          <SoundTitle>{title}</SoundTitle>
        </SoundHeader>
        <SoundSections>
          <div>
            <div>
              <Checkbox
                id={`sound-${props.id}-looping`}
                checked={sound.looping}
                onToggle={props.toggleLooping && (() => props.toggleLooping!())}
              />
              <label htmlFor={`sound-${props.id}-looping`}>looping</label>
              {sound.looping && (
                <div>
                  <label htmlFor={`sound-${props.id}-loop-interval`}>- every</label>
                  <select
                    id={`sound-${props.id}-loop-interval`}
                    value={sound.loopInterval || -1}
                    onChange={
                      props.setLoopingInterval &&
                      (({ target: { value } }) => {
                        const newValue = Number(value);
                        props.setLoopingInterval!(newValue !== -1 ? newValue : null);
                      })
                    }
                  >
                    <option value={-1}>(clip end)</option>
                    <option value={ELoopInterval.FiveSec}>5s</option>
                    <option value={ELoopInterval.TenSec}>10s</option>
                    <option value={ELoopInterval.ThirtySec}>30s</option>
                    <option value={ELoopInterval.OneMin}>1min</option>
                    <option value={ELoopInterval.FiveMin}>5min</option>
                    <option value={ELoopInterval.TenMin}>10min</option>
                    <option value={ELoopInterval.FifteenMin}>15min</option>
                    <option value={ELoopInterval.ThirtyMin}>30min</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label htmlFor={`sound-${props.id}-reverb`}>reverb</label>
              <ReverbSliderWrapper>
                <Slider
                  disabled={!sound.enabled}
                  value={sound.reverb}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={props.setReverb && (newValue => props.setReverb!(newValue))}
                />
              </ReverbSliderWrapper>
            </div>
          </div>
        </SoundSections>
      </Contents>
      <VolumeSection>
        <div>
          <VolumeSlider
            vertical
            disabled={!sound.enabled}
            value={sound.volume}
            min={VOLUME_MIN}
            max={VOLUME_MAX}
            onChange={props.setVolume && (newValue => props.setVolume!(newValue))}
          />
        </div>
        <label htmlFor={`sound-${props.id}-volume`}>{sound.volume}dB</label>
      </VolumeSection>
    </SoundContainer>
  );
};

export default Sound;
