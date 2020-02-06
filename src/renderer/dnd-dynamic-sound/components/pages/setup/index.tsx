import React from 'react';
import { useDropzone } from 'react-dropzone';
import { ISceneSet } from '../audio/types';
import { DragDropZone, FileIcon } from './styles';
import { EIconName } from '../../atoms/icon';
import { useFileHandlingHelper } from '../../shared/file-handling';

interface ISetupPageViewModel {
  className?: string;
  style?: React.CSSProperties;
}

interface ISetupPageActions {
  onSelectedSceneSet(sceneSet: ISceneSet): void;
}

export type ISetupPageProps = ISetupPageViewModel & ISetupPageActions;

const SetupPage: React.FC<ISetupPageProps> = props => {
  const fileHandlingHelper = useFileHandlingHelper();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async acceptedFiles => {
      console.log(acceptedFiles);
      if (acceptedFiles.length === 0) return;
      const sceneSet = await fileHandlingHelper.loadSceneSet(acceptedFiles[0].path);
      props.onSelectedSceneSet(sceneSet);
    },
    accept: 'application/json'
  });

  return (
    <div className={props.className} style={props.style}>
      <DragDropZone {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <div>
          <FileIcon name={EIconName.File} />
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>
              Drag + drop your <strong>Scene Set Definition File</strong> here, or click to select a
              file
            </p>
          )}
        </div>
      </DragDropZone>
    </div>
  );
};

export default SetupPage;
