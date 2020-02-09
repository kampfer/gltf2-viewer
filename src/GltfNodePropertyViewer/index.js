import React from 'react';
import Panel from '../Panel';
import SlideInput from '../SlideInput';

import './index.less';

const defaultValues = {
    position: {x:0, y:0, z:0},
    rotation: {x:0, y:0, z:0},
    scale: {x:0, y:0, z:0}
};

export default class GltfNodePropertyViewer extends React.Component {

    formatValue(v) {
        let decimal = v % 1,
            integer = Math.abs(v - decimal),
            precision = 0;

        if (decimal !== 0) {
            precision = 5 - integer.toString().length;
        }

        if (precision < 0) precision = 0;

        return v.toFixed(precision);
    }

    render() {
        let props = this.props,
            gltf = props.gltf,
            selectedNode = props.selectedNode,
            node = defaultValues;

        if (gltf && selectedNode) {
            let scene = gltf.scenes[gltf.scene];
            node = scene.getNodeByUid(selectedNode);
        }

        return (
            <Panel className="gltf-node-property-viewer" title="物体属性">
                {
                    ['Position', 'Scale'].map((propertyName) => {
                        let property = node[propertyName.toLowerCase()];
                        return (
                            <div className="input-group" key={propertyName}>
                                {
                                    ['x', 'y', 'z'].map((key, index) => 
                                        <div className="input-wrapper" key={key}>
                                            <label className="input-name">{(index === 0 ? propertyName : '') + ' ' + key.toUpperCase()}</label>
                                            <SlideInput value={this.formatValue(property[key])} unit="m"/>
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

}