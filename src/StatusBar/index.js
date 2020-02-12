import React from 'react';

import './index.less';

export default class StatusBar extends React.Component {

    makeInfo(gltf) {
        let ret = {
                vertices: 0,
                faces: 0,
                triangles: 0,
                objects: 0
            };

        if (gltf) {
            let scene = gltf.scenes[gltf.scene];
            scene.traverse(function (child) {
                ret.objects ++;
                if (child.geometry) {
                    ret.vertices += child.geometry._attributes.position.count;
                }
            });
        }

        return ret;
    }

    render() {
        let gltf = this.props.gltf,
            info = this.makeInfo(gltf);
        return (
            <div className="status-bar bg-color-black-1">
                <ul className="info">
                    {/* <li><span className="info-key">Triangles:</span><span className="info-value">0</span></li>
                    <li><span className="info-key">Faces:</span><span className="info-value">0</span></li> */}
                    <li><span className="info-key">Vertices:</span><span className="info-value">{info.vertices}</span></li>
                    <li><span className="info-key">Objects:</span><span className="info-value">{info.objects}</span></li>
                </ul>
            </div>
        );
    }

}