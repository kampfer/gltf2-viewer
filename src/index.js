// https://gltf-viewer.donmccurdy.com/
// https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0
// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#properties-reference

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import supportedBrowsers from './supportedBrowsers';
import { EnvContext } from './App/contexts';

function SupportedBrowsersTip() {
    return (
        <div style={{color: 'black'}}>本应用只支持chrome、firefox、edge浏览器，请更换浏览器！</div>
    )
}

ReactDOM.render(
    <EnvContext.Provider value="web">
        { supportedBrowsers.test(navigator.userAgent) ? <App /> : <SupportedBrowsersTip /> }
    </EnvContext.Provider>,
    document.getElementById('root')
);
