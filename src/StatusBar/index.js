import React from 'react';

import './index.less';

export default class StatusBar extends React.Component {

    render() {
        return (
            <div className="status-bar bg-color-black-1">
                <ul className="info">
                    <li><span className="info-key">Vertices:</span><span className="info-value">0</span></li>
                    <li><span className="info-key">Faces:</span><span className="info-value">0</span></li>
                    <li><span className="info-key">Triangles:</span><span className="info-value">0</span></li>
                    <li><span className="info-key">Objects:</span><span className="info-value">0</span></li>
                </ul>
            </div>
        );
    }

}