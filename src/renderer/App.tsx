import { hot } from 'react-hot-loader';
import React from 'react';
import { ISceneSet } from './components/pages/audio/types';
import { SCRATCH_SCENE_ID } from './components/pages/audio/useSceneState';
import Audio from './components/pages/audio';

const App = () => {
  const [selectedSceneId, setSelectedSceneId] = React.useState(SCRATCH_SCENE_ID);
  const [sceneSet, setSceneSet] = React.useState<ISceneSet | null>({
    sources: {
      'ketsa-sidekicks': {
        iconName: 'cloud-showers-heavy',
        audioData: new ArrayBuffer(20)
      },
      'mario-coin': {
        audioData: new ArrayBuffer(20)
      }
    },
    scenes: [
      {
        id: 'another-scene',
        sounds: {
          'ketsa-sidekicks': {}
        }
      }
    ]
  });

  return sceneSet ? (
    <Audio sceneSet={sceneSet} selectedSceneId={selectedSceneId} selectScene={setSelectedSceneId} />
  ) : (
    <div>No Scene Set Selected</div>
  );
};

export default hot(module)(App);
