import React from 'react';
import { ISceneSet } from '../pages/audio/types';

export interface IFileHandlingHelper {
  loadSceneSet(definitionFilePath: string): Promise<ISceneSet>;
}

const FileHandlingHelperContext = React.createContext<IFileHandlingHelper>({
  loadSceneSet(definitionFilePath: string): Promise<ISceneSet> {
    throw new Error('File Handling Helper not defined');
  }
});

export const FileHandlingHelperProvider = FileHandlingHelperContext.Provider;
export const FileHandlingHelperConsumer = FileHandlingHelperContext.Consumer;
export const useFileHandlingHelper = (): IFileHandlingHelper => {
  return React.useContext(FileHandlingHelperContext);
};
