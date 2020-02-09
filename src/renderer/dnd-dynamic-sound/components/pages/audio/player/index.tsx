import React from 'react';
import { ISounds, ISoundSources } from '../types';
import * as Tone from 'tone';
import { usePrevious } from '../../../../hooks';
import { loopPlayer, processSources } from './utils';

export enum EPlaybackStatus {
  Started,
  Stopped,
  Paused
}

export interface IInternalSoundRegistryItem {
  id: string;
  player: Tone.Player;
  reverb: Tone.Reverb;
  loopEvent: Tone.Loop;
}

export type IInternalSoundRegistry = IInternalSoundRegistryItem[];

interface IPlayerContext {
  loaded: boolean;
  loadingError: string | null;
  playbackStatus: EPlaybackStatus;
  position: string;

  internalSoundRegistryRef: React.MutableRefObject<IInternalSoundRegistry>;
  setSourcesLoaded(loaded: boolean): void;
  setSourcesLoadError(err: string): void;
  start(): void;
  stop(): void;
  pause(): void;
}

const missingPlayerContextValueErrorMsg =
  'PlayerContext has not been defined yet - please wrap a top-level component in a <PlayerProvider>...</PlayerProvider>';
const PlayerContext = React.createContext<IPlayerContext>({
  loaded: false,
  loadingError: null,
  playbackStatus: EPlaybackStatus.Stopped,
  position: '0:0:00',
  internalSoundRegistryRef: null,
  setSourcesLoaded(loaded: boolean): void {
    throw new Error(missingPlayerContextValueErrorMsg);
  },
  setSourcesLoadError(err: string): void {
    throw new Error(missingPlayerContextValueErrorMsg);
  },
  start(): void {
    throw new Error(missingPlayerContextValueErrorMsg);
  },
  stop(): void {
    throw new Error(missingPlayerContextValueErrorMsg);
  },
  pause(): void {
    throw new Error(missingPlayerContextValueErrorMsg);
  }
});

Tone.context.latencyHint = 'playback';

export interface IPlayerProviderProps {}

export const PlayerProvider: React.FC<IPlayerProviderProps> = props => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadingError, setLoadingError] = React.useState<string | null>(null);
  // general state
  const [playbackStatus, setPlaybackStatus] = React.useState<EPlaybackStatus>(
    EPlaybackStatus.Stopped
  );
  const [position, setPosition] = React.useState<string>(Tone.Transport.position as string);
  useAnimationFrame(() => {
    setPosition(Tone.Transport.position as string);
  });

  const soundRegistry = React.useRef<IInternalSoundRegistry>([]);

  return (
    <PlayerContext.Provider
      value={{
        loaded,
        loadingError,
        playbackStatus,
        position,
        internalSoundRegistryRef: soundRegistry,
        setSourcesLoaded(loaded: boolean): void {
          setLoaded(loaded);
        },
        setSourcesLoadError(err: string): void {
          setLoadingError(err);
        },
        async start(): Promise<void> {
          await Tone.start();
          Tone.Transport.start('+0.1');
          setPlaybackStatus(EPlaybackStatus.Started);
        },
        stop(): void {
          Tone.Transport.stop();
          setPlaybackStatus(EPlaybackStatus.Stopped);
        },
        pause(): void {
          Tone.Transport.pause();
          setPlaybackStatus(EPlaybackStatus.Paused);
        }
      }}
    >
      {props.children}
    </PlayerContext.Provider>
  );
};

export interface IUsePlayerPayload {
  loaded: boolean;
  loadingError: string | null;
  playbackStatus: EPlaybackStatus;
  position: string;
  isTransitioning: boolean;
  start(): void;
  stop(): void;
  pause(): void;
}

export function usePlayer(
  sources: ISoundSources,
  sounds: ISounds,
  transitionKey: string,
  transitionTimeSeconds: number | null
): IUsePlayerPayload {
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const playerContext = React.useContext(PlayerContext);

  const clearOldState = () => {
    playerContext.stop();
    for (const oldSound of playerContext.internalSoundRegistryRef.current) {
      oldSound.reverb.dispose();
      oldSound.player.dispose();
      oldSound.loopEvent.dispose();
    }
    playerContext.internalSoundRegistryRef.current = [];
  };

  React.useEffect(() => {
    clearOldState();
    processSources(sources, sounds).then(newRegistry => {
      playerContext.internalSoundRegistryRef.current = newRegistry;
      // initial load
      Tone.ToneAudioBuffer.loaded()
        .then(() => {
          console.log('LOADED');
          playerContext.setSourcesLoaded(true);
        })
        .catch(e => {
          console.warn(e);
          playerContext.setSourcesLoadError('LOADING FAILED');
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    console.log('SOURCES CHANGED');
    clearOldState();

    processSources(sources, sounds).then(newRegistry => {
      playerContext.internalSoundRegistryRef.current = newRegistry;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources]);

  const prevSounds = usePrevious(sounds);
  const prevTransitionKey = usePrevious(transitionKey);
  React.useEffect(() => {
    if (sounds !== prevSounds) {
      const isImmediateTransition =
        transitionKey === prevTransitionKey ||
        transitionTimeSeconds === null ||
        transitionTimeSeconds === 0 ||
        playerContext.playbackStatus !== EPlaybackStatus.Started;
      // console.log(isImmediateTransition ? "IMMEDIATE TRANSITION" : "SLOW TRANSITION");

      // handle sound changes
      for (const soundId of Object.keys(sounds)) {
        const newSound = sounds[soundId];
        const prevSound = prevSounds[soundId];
        const { player, loopEvent, reverb } = playerContext.internalSoundRegistryRef.current.find(
          s => s.id === soundId
        )!;

        if (isImmediateTransition) {
          // immediate change
          if (newSound.enabled !== prevSound.enabled) {
            player.mute = !newSound.enabled;
          }

          if (newSound.volume !== prevSound.volume) {
            player.volume.value = newSound.volume;
          }

          if (newSound.reverb !== prevSound.reverb) {
            reverb.wet.value = newSound.reverb;
          }
        } else {
          setIsTransitioning(true);
          const relativeTransitionTime = `+${transitionTimeSeconds!}`;
          // transition
          if (newSound.enabled !== prevSound.enabled) {
            // console.log("ENABLE CHANGED");
            if (newSound.enabled) {
              // console.log("RAMPING UP");
              // unmute
              player.mute = false;
              // start volume low
              player.volume.value = -200;
              // ramp up to desired volume
              player.volume.linearRampTo(newSound.volume, transitionTimeSeconds!);
              // set reverb immediately
              reverb.wet.value = newSound.reverb;
              Tone.Transport.scheduleOnce(time => {
                Tone.Draw.schedule(() => {
                  // console.log("RAMPED UP")
                }, time);
              }, relativeTransitionTime);
            } else {
              // console.log("RAMPING DOWN");
              // start at original volume
              player.volume.linearRampTo(-200, transitionTimeSeconds!);
              // mute after ramp up
              Tone.Transport.scheduleOnce(time => {
                Tone.Draw.schedule(() => {
                  // mute and set reverb after transition
                  player.mute = true;
                  reverb.wet.value = newSound.reverb;
                  // console.log("RAMPED DOWN + MUTED");
                }, time);
              }, relativeTransitionTime);
            }
          } else if (newSound.volume !== prevSound.volume) {
            player.volume.linearRampTo(newSound.volume, relativeTransitionTime);
          } else if (newSound.reverb !== prevSound.reverb) {
            reverb.wet.linearRampTo(newSound.reverb, transitionTimeSeconds!);
          }

          Tone.Transport.scheduleOnce(time => {
            Tone.Draw.schedule(() => {
              setIsTransitioning(false);
            }, time);
          }, relativeTransitionTime);
        }

        if (
          newSound.looping !== prevSound.looping ||
          newSound.loopInterval !== prevSound.loopInterval
        ) {
          // stop looping immediately
          loopPlayer(player, loopEvent, newSound.looping, newSound.loopInterval);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sounds, transitionKey, transitionTimeSeconds, playerContext.playbackStatus]);

  return {
    ...playerContext,
    isTransitioning
  };
}

function useAnimationFrame(callback: (deltaTime: number) => void) {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      requestRef.current && cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Make sure the effect runs only once
}
