import './index.less';

import React from 'react';
import Panel from '../Panel';
import { ObjectType } from '@webglRenderEngine/constants';

const nodeTypeToIcon = {
    [ObjectType.GraphObject]: 'empty-object',
    [ObjectType.Mesh]: 'mesh',
    [ObjectType.PerspectiveCamera]: 'camera',
    [ObjectType.OrthographicCamera]: 'camera'
};

class Node extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            expanded: false
        };

        this.handleClick = this.handleClick.bind(this);
    }

    getNodeName(node) {
        let name = node.name;

        if (!name) {
            name = node.constructor.name + '.' + node.uid;
        }

        return name;
    }

    handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        let expanded = !this.state.expanded;
        this.setState({ expanded });

        if (this.props.onClick) this.props.onClick(this.props.node.uid);
    }

    createIcon(type = nodeTypeToIcon[ObjectType.GraphObject], index) {
        return <div className={`icon ${type}`} key={index}></div>
    }

    render() {
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

            icons.push(this.createIcon(expanded ? 'collapse' : 'expand', icons.length));

            children = (
                <div className='node-children'>
                    {
                        node.children.map(
                            child => 
                                <Node
                                    node={child}
                                    level={level + 1}
                                    key={child.uid}
                                    onClick={props.onClick}
                                    selectedNode={props.selectedNode}
                                ></Node>
                        )
                    }
                </div>
            );

        }

        icons.push(this.createIcon(nodeTypeToIcon[node.type], icons.length));

        for(let i = 0; i < level; i++) {
            indentGuides.push(<div className="indent-guide" key={i}></div>);
        }

        return (
            <div className={className}>
                <div className="node-label" onClick={this.handleClick}>
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

}

export default class GltfNodeViewer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let props = this.props,
            gltf = props.gltf,
            nodes = gltf && gltf.scenes[gltf.scene].children;

        return (
            <Panel className="gltf-node-viewer" title="节点大纲">
                <div className="node-list">
                    {
                        nodes && nodes.map(
                            node => 
                                <Node
                                    node={node}
                                    level={0}
                                    key={node.uid}
                                    onClick={props.onSelectNode}
                                    selectedNode={props.selectedNode}
                                ></Node>
                        )
                    }
                </div>
            </Panel>
        );
    }

}