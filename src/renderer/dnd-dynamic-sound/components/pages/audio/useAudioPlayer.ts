import React from 'react';
import * as Tone from 'tone';
import { BarsBeatsSixteenths, Time } from 'tone/build/esm/core/type/Units';
import { ISounds, ISoundSources } from './types';
import { usePrevious } from '../../../hooks';

// global tone config
Tone.context.latencyHint = 'playback';

export enum EPlaybackStatus {
  Started,
  Stopped,
  Paused
}

interface IInternalSoundRegistryItem {
  id: string;
  player: Tone.Player;
  reverb: Tone.Reverb;
  loopEvent: Tone.Loop;
}

type IInternalSoundRegistry = IInternalSoundRegistryItem[];

function loopPlayer(
  player: Tone.Player,
  loopEvent: Tone.Loop,
  looping: boolean,
  loopInterval: Time | null
) {
  if (loopInterval) {
    player.loop = false;
    loopEvent.interval = loopInterval;
    if (looping) loopEvent.start();
  } else {
    // this is buggy - it ignores the transport timeline
    player.loop = looping;
    if (looping && Tone.Transport.state === 'started') player.seek(0);
  }
}

async function processSources(
  sources: ISoundSources,
  sounds: ISounds
): Promise<IInternalSoundRegistry> {
  console.log('processing sources');

  return Promise.all(
    Object.keys(sources).map<Promise<IInternalSoundRegistryItem>>(async sourceId => {
      const source = sources[sourceId];
      const sound = sounds[sourceId];

      const muted = !sound.enabled;
      const volume = sound.volume;
      const looping = sound.looping;
      const loopInterval = sound.loopInterval;
      const reverb = sound.reverb;

      const toneReverb = (await new Tone.Reverb().generate()).toDestination();
      toneReverb.wet.value = reverb;

      const audioFileUrl = source.audioFileUrl;
      console.log(sourceId, 'audio file url', audioFileUrl);

      const player = new Tone.Player(audioFileUrl).sync().chain(toneReverb);
      player.volume.value = volume;
      player.mute = muted;
      player.autostart = true;

      const loopEvent = new Tone.Loop(time => {
        player.start(time);
      });

      loopPlayer(player, loopEvent, looping, loopInterval);

      return {
        id: sourceId,
        player,
        reverb: toneReverb,
        loopEvent
      };
    })
  );
}

interface IAudioPlayerHookResult {
  loaded: boolean;
  loadingError: string | null;
  isTransitioning: boolean;
  playbackStatus: EPlaybackStatus;
  position: BarsBeatsSixteenths | Time;
  start(): void;
  stop(): void;
  pause(): void;
}

export default function useAudioPlayer(
  sources: ISoundSources,
  sounds: ISounds,
  transitionKey: string,
  transitionTimeSeconds: number | null
): IAudioPlayerHookResult {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadingError, setLoadingError] = React.useState<string | null>(null);
  // general state
  const [playbackStatus, setPlaybackStatus] = React.useState<EPlaybackStatus>(
    EPlaybackStatus.Stopped
  );
  const [position, setPosition] = React.useState<BarsBeatsSixteenths | Time>(
    Tone.Transport.position
  );
  useAnimationFrame(() => {
    setPosition(Tone.Transport.position);
  });
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // event state
  const soundRegistry = React.useRef<IInternalSoundRegistry>([]);

  React.useEffect(() => {
    processSources(sources, sounds).then(newRegistry => {
      soundRegistry.current = newRegistry;
    });
    // initial load
    Tone.ToneAudioBuffer.loaded()
      .then(() => {
        console.log('LOADED');
        setLoaded(true);
      })
      .catch(e => {
        console.warn(e);
        setLoadingError('LOADING FAILED');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    console.log('SOURCES CHANGED');
    for (const oldSound of soundRegistry.current) {
      oldSound.reverb.dispose();
      oldSound.player.dispose();
      oldSound.loopEvent.dispose();
    }

    processSources(sources, sounds).then(newRegistry => {
      soundRegistry.current = newRegistry;
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
        playbackStatus !== EPlaybackStatus.Started;
      // console.log(isImmediateTransition ? "IMMEDIATE TRANSITION" : "SLOW TRANSITION");

      // handle sound changes
      for (const soundId of Object.keys(sounds)) {
        const newSound = sounds[soundId];
        const prevSound = prevSounds[soundId];
        const { player, loopEvent, reverb } = soundRegistry.current.find(s => s.id === soundId)!;

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
  }, [sounds, transitionKey, transitionTimeSeconds, playbackStatus]);

  return {
    loaded,
    loadingError,
    position,
    isTransitioning,
    playbackStatus,
    async start() {
      await Tone.start();
      Tone.Transport.start('+0.1');
      setPlaybackStatus(EPlaybackStatus.Started);
    },
    stop() {
      Tone.Transport.stop();
      setPlaybackStatus(EPlaybackStatus.Stopped);
    },
    pause() {
      Tone.Transport.pause();
      setPlaybackStatus(EPlaybackStatus.Paused);
    }
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
