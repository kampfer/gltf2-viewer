import React from 'react';

import './index.less';

export default function StatusBar() {
    return (
        <div className="status-bar bg-color-black-1">
            <ul className="info">
                {/* <li><span className="info-key">Triangles:</span><span className="info-value">0</span></li>
                <li><span className="info-key">Faces:</span><span className="info-value">0</span></li> */}
                <li><span className="info-key">Vertices:</span><span className="info-value">{1212}</span></li>
                <li><span className="info-key">Objects:</span><span className="info-value">{12123}</span></li>
            </ul>
        </div>
    );
}