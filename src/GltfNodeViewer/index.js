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

    getNodeName(node) {
        let name = node.name;

        if (!name) {
            name = node.constructor.name + '.' + node.uid;
        }

        return name;
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
                                    <p className="item-content">{this.getNodeName(node)}</p>
                                    {this.generateNode(node.children)}
                                </li>
                            );
                        } else {
                            return (
                                <li key={node.uid}><p className="item-content">{this.getNodeName(node)}</p></li>
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
                    {/* {gltf && this.generateNode(gltf.scenes[gltf.scene].children)} */}
                    <div className="node expandable">
                        <div className="node-label">
                            <span className="node-name">node.1</span>
                        </div>
                        <div className="node-children">
                            <div className="node expandable collapsed">
                                <div className="node-label">
                                    <div className="indent">
                                        <div class="indent-guide"></div>
                                        <div class="indent-guide"></div>
                                    </div>
                                    <div className="node-name">node.1-1</div>
                                </div>
                                <div className="node-children">
                                    <div className="node default">
                                        <div className="node-label">
                                            <span className="node-name">node.1-1-1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="node default">
                                <div className="node-label">
                                    <span className="node-name">node.1-2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="node expandable">
                        <div className="node-label">
                            <span className="node-name">node.2</span>
                        </div>
                        <div className="node-children">
                            <div className="node default">
                                <div className="node-label">
                                    <span className="node-name">node.2-1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="node default">
                        <div className="node-label">
                            <span className="node-name">node.3</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}