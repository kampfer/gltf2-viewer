import React from 'react';
import ReactDOM from 'react-dom';
import ElectronApp from '../../App/Electron';
import { EnvContext } from '../../App/contexts';

ReactDOM.render(
    <EnvContext.Provider value="electron">
        <ElectronApp></ElectronApp>
    </EnvContext.Provider>,
    document.getElementById('root')
);
