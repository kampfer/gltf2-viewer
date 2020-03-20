import React from 'react';

import './index.less';

export default function Layer(props) {

    return <div className="layer" onClick={props.onClick}>{props.children}</div>

}