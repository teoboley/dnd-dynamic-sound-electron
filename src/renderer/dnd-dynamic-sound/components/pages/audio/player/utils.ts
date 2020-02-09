import * as Tone from 'tone';
import { Time } from 'tone/build/esm/core/type/Units';
import { ISounds, ISoundSources } from '../types';
import { IInternalSoundRegistry, IInternalSoundRegistryItem } from './index';

export function loopPlayer(
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

export async function processSources(
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
