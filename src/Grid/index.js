import React from 'react';

import './index.less';

export class GridContainer extends React.Component {

    render() {
        let props = this.props,
            className = 'grid-container';

        if (props.vertical) {
            className += ' vertical';
        }

        return (
            <div className={className}>
                {props.children}
            </div>
        );
    }

}

export class Grid extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let props = this.props,
            width = props.width,
            height = props.height,
            flexGrow = props.flexGrow,
            flexBasis,
            style = { flexGrow, width };

        if (width !== undefined && height !== undefined) {
            console.warn(`Grid.render: 不允许同时设置width和height`);
        }

        if (width !== undefined) {
            flexBasis = width;
        }

        if (height !== undefined) {
            flexBasis = height;
        }

        style.flexBasis = flexBasis;

        return (
            <div className="grid" style={style}>
                {props.children}
            </div>
        );
    }

}