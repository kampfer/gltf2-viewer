import React from 'react';
import ReactDOM from 'react-dom';
import Layer from '../Layer';

import './index.less';

export default function Spinner() {

    return ReactDOM.createPortal(
        <Layer>
            <div className="spinner">
                <div className="spinner-circle"></div>
            </div>
        </Layer>,
        document.body
    );

}