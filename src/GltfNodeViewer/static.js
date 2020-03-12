import React from 'react';
import Panel from '../Panel';

import './index.less';

function Node() {
    let props = this.props,
        node = props.node,
        level = props.level,
        name = this.getNodeName(node),
        expanded = this.state.expanded,
        selected = props.selectedNode === node.uid,
        className = 'node',
        indentGuides = [],
        icons = [],
        children;

    if (selected) {
        className += ' selected';
    }

    if (node.children.length > 0) {

        if (expanded) {
            className += ' expanded';
        } else {
            className += ' collapsed';
        }

        icons.push(
            this.createIcon(
                expanded ? 'collapse' : 'expand',
                icons.length,
                this.handleExpandAndCollapse
            )
        );

        children = (
            <div className='node-children'>
                {
                    node.children.map(
                        child => 
                            <Node
                                node={child}
                                level={level + 1}
                                key={child.uid}
                                onSelectNode={props.onSelectNode}
                                selectedNode={props.selectedNode}
                            ></Node>
                    )
                }
            </div>
        );

    }

    icons.push(this.createIcon(nodeTypeToIcon[node.type], icons.length));

    for(let i = 0; i < level; i++) {
        indentGuides.push(
            <div className="indent-guide" key={i * 2}></div>,
            <div className="indent-guide" key={i * 2 + 1}></div>
        );
    }

    return (
        <div className={className}>
            <div className="node-label" onClick={this.handleSelect}>
                <div className="indent">
                    { indentGuides }
                </div>
                { icons }
                <div className="node-name">{name}</div>
            </div>
            { children }
        </div>
    );
}

export default function GLTFNodePropertyViewer(props) {
    let nodes = [];
    return (
        <Panel className="gltf-node-viewer" title="节点大纲" height={props.height}>
            <div className="node-list-wrapper">
                <div className="node-list">
                    {
                        nodes && nodes.map(
                            node =>
                                <Node
                                    node={node}
                                    level={0}
                                    key={node.uid}
                                    onSelectNode={props.onSelectNode}
                                    selectedNode={props.selectedNode}
                                ></Node>
                        )
                    }
                </div>
            </div>
        </Panel>
    );
}