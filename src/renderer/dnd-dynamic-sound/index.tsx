import React from 'react';
import { ISceneSet } from './components/pages/audio/types';
import { SCRATCH_SCENE_ID } from './components/pages/audio/useSceneState';
import Audio from './components/pages/audio';
import SetupPage from './components/pages/setup';
import './index.css';
import { FileHandlingHelperProvider, IFileHandlingHelper } from './components/shared/file-handling';
import { Container } from './styles';

export interface IDndDynamicSoundProps {
  fileHandlingHelper: IFileHandlingHelper;
}

const DndDynamicSound: React.FC<IDndDynamicSoundProps> = props => {
  const [selectedSceneId, setSelectedSceneId] = React.useState(SCRATCH_SCENE_ID);
  const [sceneSet, setSceneSet] = React.useState<ISceneSet | null>(null);

  return (
    <FileHandlingHelperProvider value={props.fileHandlingHelper}>
      <Container>
        {sceneSet ? (
          <Audio
            key={sceneSet.key}
            sceneSet={sceneSet}
            selectedSceneId={selectedSceneId}
            onSceneSelected={setSelectedSceneId}
            onNewSceneSetLoaded={setSceneSet}
          />
        ) : (
          <SetupPage onSelectedSceneSet={setSceneSet} />
        )}
      </Container>
    </FileHandlingHelperProvider>
  );
};

export default DndDynamicSound;
