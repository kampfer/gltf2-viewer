import React from 'react';
import Panel from '../Panel';
import SlideInput from '../SlideInput';
import {
    mathUtils
} from 'webglRenderEngine';

import './index.less';

const defaultValues = {
    position: {x:0, y:0, z:0},
    rotation: {x:0, y:0, z:0},
    scale: {x:0, y:0, z:0}
};

const units = {
    position: 'm',
    rotation: '\u00B0',
    scale: '',
    Fovy: '\u00B0',
    Aspect: '',
    Near: 'm',
    Far: 'm'
};

const unitFormaters = {
    rotation: mathUtils.radToDeg,
    Fovy: mathUtils.radToDeg,
}

export default class GltfNodePropertyViewer extends React.Component {

    formatValue(value, type) {
        let formater = unitFormaters[type];
        if (formater) return formater(value);
        return value;
    }

    render() {
        let props = this.props,
            gltf = props.gltf,
            selectedNode = props.selectedNode,
            node = defaultValues;

        if (gltf && selectedNode) {
            let scene = gltf.scenes[gltf.scene];
            node = scene.getChildByUid(selectedNode);
        }

        return (
            <Panel className="gltf-node-property-viewer" title="物体属性">
                {
                    node.isCameraHelper &&
                    <div className="input-group">
                        {
                            ['Fovy', 'Aspect', 'Near', 'Far'].map((key) =>
                                <div className="input-wrapper" key={key}>
                                    <label className="input-name">{key}</label>
                                    <SlideInput value={this.formatValue(node.camera[key.toLowerCase()], key)} unit={units[key]}/>
                                </div>
                            )
                        }
                    </div>
                }
                {
                    ['Position', 'Rotation', 'Scale'].map((propertyName) => {
                        let propertyNameInLowerCase = propertyName.toLowerCase(),
                            property = node[propertyNameInLowerCase];
                        return (
                            <div className="input-group" key={propertyName}>
                                {
                                    ['x', 'y', 'z'].map((key, index) =>
                                        <div className="input-wrapper" key={key}>
                                            <label className="input-name">{(index === 0 ? propertyName : '') + ' ' + key.toUpperCase()}</label>
                                            <SlideInput value={this.formatValue(property[key], propertyNameInLowerCase)} unit={units[propertyNameInLowerCase]}/>
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