import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay, faStop, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { IconProp as FontAwesomeIconProp, library } from '@fortawesome/fontawesome-svg-core';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { faFile, far } from '@fortawesome/free-regular-svg-icons';

library.add(fas);
library.add(far);

export enum EIconName {
  Play,
  Pause,
  Stop,
  AudioSource,
  File
}

interface IIconViewModel {
  name: EIconName;
  faIconOverride?: FontAwesomeIconProp;

  className?: string;
  style?: React.CSSProperties;
}

interface IIconActions {}

export type IIconProps = IIconViewModel & IIconActions;

const Icon: React.FC<IIconProps> = props => {
  let faIcon = null;
  switch (props.name) {
    case EIconName.Play:
      faIcon = faPlay;
      break;
    case EIconName.Pause:
      faIcon = faPause;
      break;
    case EIconName.Stop:
      faIcon = faStop;
      break;
    case EIconName.AudioSource:
      faIcon = faVolumeUp;
      break;
    case EIconName.File:
      faIcon = faFile;
      break;
  }

  // @ts-ignore
  faIcon = props.faIconOverride || faIcon;

  return faIcon ? (
    <FontAwesomeIcon icon={faIcon} className={props.className} style={props.style} />
  ) : (
    <span className={props.className} style={props.style} />
  );
};

export default Icon;
