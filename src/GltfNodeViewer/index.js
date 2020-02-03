import './index.less';

import React from 'react';

class Node extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            expandable: props.node.children.length > 0,
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

    render() {
        let props = this.props,
            node = props.node,
            level = props.level,
            name = this.getNodeName(node),
            className = 'node',
            expanded = this.state.expanded,
            selected = props.selectedNode === node.uid,
            indentGuides = [],
            children;

        if (expanded) {
            className += ' collapsed';
        }

        if (node.children.length > 0) {
            className += ' expandable';

            children = (
                <div className={expanded ? 'node-children' : 'node-children hide'}>
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
        } else {
            className += ' default';
        }

        for(let i = 0; i < level; i++) {
            indentGuides.push(<div className="indent-guide" key={i}></div>);
        }

        return (
            <div className={className}>
                <div className={"node-label" + (selected ? ' selected' : '')} onClick={this.handleClick}>
                    <div className="indent">
                        { indentGuides }
                    </div>
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

        this.state = {
            selectedNode: undefined
        };

        this.handleClickNode = this.handleClickNode.bind(this);
    }

    handleClickNode(uid) {
        this.setState({ selectedNode: uid });
    }

    render() {
        let state = this.state,
            props = this.props,
            gltf = props.gltf,
            nodes = gltf && gltf.scenes[gltf.scene].children;

        return (
            <div className="gltf-node-viewer">
                <div className="title">Scene Collection</div>
                <div className="content">
                    {
                        nodes && nodes.map(
                            node => 
                                <Node
                                    node={node}
                                    level={0}
                                    key={node.uid}
                                    onClick={this.handleClickNode}
                                    selectedNode={state.selectedNode}
                                ></Node>
                        )
                    }
                </div>
            </div>
        );
    }

}