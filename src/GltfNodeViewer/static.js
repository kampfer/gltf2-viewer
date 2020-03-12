import React from 'react';
import Panel from '../Panel';

import './index.less';

let types = ['empty-object', 'mesh', 'camera'];

function Node(props) {
    let node = props.node,
        level = props.level,
        expanded = node.expanded || Math.round(Math.random()),
        // expanded = Math.round(Math.random()),
        selected = Math.round(Math.random()),
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

        icons.push(<i className={`icon ${expanded ? 'collapse' : 'expand'}`} key={icons.length}>icon</i>);

        children = (
            <div className='node-children'>
                {
                    node.children.map(
                        child =>
                            <Node
                                node={child}
                                level={level + 1}
                                key={child.uid}
                            ></Node>
                    )
                }
            </div>
        );

    }

    icons.push(<i className={`icon ${types[Math.round(Math.random() * 10) % 3]}`} key={icons.length}>icon</i>)

    for(let i = 0; i < level; i++) {
        indentGuides.push(
            <div className="indent-guide" key={i * 2}></div>,
            <div className="indent-guide" key={i * 2 + 1}></div>
        );
    }

    return (
        <div className={className}>
            <div className="node-label">
                <div className="indent" style={{width: indentGuides.length * 10}}>
                    { indentGuides }
                </div>
                { icons }
                <div className="node-name">test node</div>
                <i className="icon visible">icon</i>
            </div>
            { children }
        </div>
    );
}

export default function GLTFNodePropertyViewer(props) {
    let nodes = [{
        uid: 1,
        expanded: true,
        children: [{
            uid: 11,
            expanded: true,
            children: [{
                uid: 111,
                children: []
            }]
        }]
    },{
        uid: 2,
        children: []
    },{
        uid: 3,
        children: []
    }];
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
                                ></Node>
                        )
                    }
                </div>
            </div>
        </Panel>
    );
}