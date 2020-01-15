import React from 'react';
import ReactDOM from 'react-dom';

import './gltf';
import fileUploader from './FileUploader';

ReactDOM.render(
    fileUploader(),
    document.getElementById('root')
);
