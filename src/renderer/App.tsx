import { hot } from 'react-hot-loader';
import React from 'react';
import DndDynamicSound from './dnd-dynamic-sound';
import fileHandlingHelper from './file-handling-impl';

const App = () => <DndDynamicSound fileHandlingHelper={fileHandlingHelper} />;

export default hot(module)(App);
