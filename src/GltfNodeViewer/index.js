import './index.less';

import React from 'react';
import Panel from '../Panel';
import { constants } from 'webglRenderEngine';

const {
    OBJECT_TYPE_MESH,
    OBJECT_TYPE_PERSPECTIVE_CAMERA,
    OBJECT_TYPE_ORTHOGRAPHIC_CAMERA,
} = constants;

const nodeTypeToIcon = {
    default: 'empty-object',
    [OBJECT_TYPE_MESH]: 'mesh',
    [OBJECT_TYPE_PERSPECTIVE_CAMERA]: 'camera',
    [OBJECT_TYPE_ORTHOGRAPHIC_CAMERA]: 'camera'
};

class Node extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            expanded: false,
            visible: props.node.visible
        };

        this.handleExpandAndCollapse = this.handleExpandAndCollapse.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
    }

    getNodeName(node) {
        let name = node.name;

        if (!name) {
            name = node.constructor.name + '.' + node.uid;
        }

        return name;
    }

    handleExpandAndCollapse(e) {
        e.preventDefault();
        e.stopPropagation();

        let expanded = !this.state.expanded;
        this.setState({ expanded });
    }

    handleSelect(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.props.onSelectNode) this.props.onSelectNode(this.props.node.uid);
    }

    createIcon(type = nodeTypeToIcon.default, index, onClick) {
        return <i className={`icon ${type}`} key={index} onClick={onClick}>{type}</i>
    }

    toggleVisibility(e) {
        e.preventDefault();
        e.stopPropagation();

        let visible = !this.state.visible;
        this.props.node.visible = visible;
        this.setState({visible});
    }

    render() {
        let props = this.props,
            state = this.state,
            node = props.node,
            level = props.level,
            name = this.getNodeName(node),
            expanded = state.expanded,
            visible = state.visible,
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
                    <i className={`icon ${visible ? 'visible' : 'hidden'}`} onClick={this.toggleVisibility}></i>
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

}