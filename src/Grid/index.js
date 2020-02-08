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

    render() {
        let props = this.props,
            width = props.width,
            height = props.height,
            flexGrow = props.flexGrow,
            style = { flexBasis: width, height, flexGrow };

        return (
            <div className="grid" style={style}>
                {props.children}
            </div>
        );
    }

}