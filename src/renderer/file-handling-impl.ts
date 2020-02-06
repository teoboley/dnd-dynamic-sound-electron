import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { isSceneSetJSON } from './dnd-dynamic-sound/components/pages/setup/types';
import { ISceneSet, ISoundSources } from './dnd-dynamic-sound/components/pages/audio/types';
import { IFileHandlingHelper } from './dnd-dynamic-sound/components/shared/file-handling';

const readFileAsync = promisify(fs.readFile);

const fileHandlingHelper: IFileHandlingHelper = {
  async loadSceneSet(definitionFilePath: string): Promise<ISceneSet> {
    const defParentDir = path.resolve(definitionFilePath, '..');
    console.log(defParentDir);
    const definitionFileContents: string = await readFileAsync(definitionFilePath, {
      encoding: 'utf-8'
    });

    if (definitionFileContents) {
      const parsedObj = JSON.parse(definitionFileContents);
      if (isSceneSetJSON(parsedObj)) {
        const transformedSceneSet: ISceneSet = {
          scenes: parsedObj.scenes,
          sources: Object.keys(parsedObj.sources).reduce<ISoundSources>((acc, sourceId) => {
            const { audioFilename, ...source } = parsedObj.sources[sourceId];
            const audioFilePath = path.isAbsolute(audioFilename)
              ? audioFilename
              : path.resolve(defParentDir, audioFilename);

            return {
              ...acc,
              [sourceId]: {
                ...source,
                audioFileUrl: `file://${audioFilePath}`
              }
            };
          }, {})
        };

        console.log(transformedSceneSet);

        return transformedSceneSet;
      } else {
        throw Error('Definition File in uploaded bundle did not conform to Scene Set spec');
      }
    } else {
      throw Error('No Definition File found in uploaded bundle');
    }
  }
};

export default fileHandlingHelper;
