import './index.less';

import React from 'react';

export default class GltfNodeViewer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            nodes: {}
        };

        this.handleClick = this.handleClick.bind(this);
    }

    updateNodeState(gltf) {
        let nodes = [];
        if (gltf) {
            let scene = gltf.scenes[gltf.scene];
            scene.traverse(function (child) {
                nodes.push({
                    uid: child.uid,
                    expandable: child.children.length > 0 ? true : false,
                    expanded: false
                });
            });
        }
        this.setState({ nodes });
    }

    generateNode(nodes) {
        return (
            <ul>
                {
                    nodes.map((node) => {
                        if (node.children.length > 0) {
                            let className = 'expandable',
                                uid = node.uid;
                            if (!(this.state[uid] && this.state[uid].expanded)) {
                                className += ' collapsed';
                            }
                            return (
                                <li key={uid} className={className} onClick={this.handleClick} data-uid={uid}>
                                    <p className="item-content">> {node.name || node.type}</p>
                                    {this.generateNode(node.children)}
                                </li>
                            );
                        } else {
                            return (
                                <li key={node.uid}>{node.name || node.type}</li>
                            );
                        }
                    })
                }
            </ul>
        )
    }

    handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        let uid = e.currentTarget.dataset.uid,
            state = this.state,
            nodes = {};
        nodes[uid] = { expanded: !(state[uid] && state[uid].expanded) };
        this.setState(nodes);
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