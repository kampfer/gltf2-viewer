import './index.less';

import React from 'react';

export default class GltfNodeViewer extends React.Component {

    constructor(props) {
        super(props);
    }

    generateNode(nodes) {
        return (
            <ul>
                {  
                    nodes.map((node) => {
                        if (node.children.length > 0) {
                            return (
                                <li><ul>
                                    <li>{node.name || node.type}</li>
                                    <li>{this.generateNode(node.children)}</li>
                                </ul></li>
                            );
                        } else {
                            return (
                                <li>{node.name || node.type}</li>
                            );
                        }
                    })
                }
            </ul>
        )
    }

    render() {
        let props = this.props,
            gltf = props.gltf;

        return (
            <div className="gltf-node-viewer">
                <div className="title">Scene Collection</div>
                <div className="content">
                    {gltf && this.generateNode(gltf.scenes[gltf.scene].children)}
                </div>
            </div>
        );
    }

}