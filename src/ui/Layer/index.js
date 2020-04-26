import React from 'react';
import ReactDOM from 'react-dom';

import './index.less';

// Layer将children添加到body的最后，脱离正常的节点结构
export default function Layer(props) {

    return ReactDOM.createPortal(
        <div className="layer" onClick={props.onClick}>
            <div className="layer-content">
                {props.children}
            </div>
        </div>,
        document.body
    );

}