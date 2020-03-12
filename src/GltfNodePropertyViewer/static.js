import React from 'react';
import Panel from '../Panel';
import SlideInput from '../SlideInput';

import './index.less';

export default function GLTFNodePropertyViewer() {
    return (
        <Panel className="gltf-node-property-viewer" title="物体属性">
            {
                ['Position', 'Rotation', 'Scale'].map((propertyName) => {
                    return (
                        <div className="input-group" key={propertyName}>
                            {
                                ['x', 'y', 'z'].map((key, index) => 
                                    <div className="input-wrapper" key={key}>
                                        <label className="input-name">{(index === 0 ? propertyName : '') + ' ' + key.toUpperCase()}</label>
                                        <SlideInput value={1000} unit={'m'}/>
                                    </div>
                                )
                            }
                        </div>
                    );
                    
                })
            }
        </Panel>
    );
}