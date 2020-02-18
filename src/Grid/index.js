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

        // this.state = {
        //     width: props.width,
        //     height: props.height
        // };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    getPosition(e) {
        if (this._resizeDirection === 'x') {
            return e.clientX;
        } else if (this._resizeDirection === 'y') {
            return e.clientY;
        } else {
            console.warn(`direction: ${this._resizeDirection} 不支持！`);
        }
    }

    getSize() {
        if (this._resizeDirection === 'x') {
            return this.props.width;
        } else if (this._resizeDirection === 'y') {
            return this.props.height;
        }
    }

    handleMouseDown(e) {
        let elem = e.target;

        this._resizeDirection = elem.dataset.direction;

        this._lastPosition = this.getPosition(e);
        this._lastSize = this.getSize();

        this._resizing = true;
    }

    handleMouseUp() {
        this._resizing = false;
        this._resizeDirection = undefined;
        this._lastPosition = undefined;
        this._lastSize = undefined;
    }

    handleMouseMove(e) {
        if (!this._resizing) return;

        let position = this.getPosition(e),
            delta = position - this._lastPosition,
            size = this._lastSize + delta;
        // if (this._resizeDirection === 'x') {
        //     this.setState({width: this._lastSize + delta});
        // } else if (this._resizeDirection === 'y') {
        //     this.setState({height: this._lastSize + delta});
        // }
        this.props.onResize({direction: this._resizeDirection, delta, size});
    }

    componentDidMount() {
        window.addEventListener('mouseup', this.handleMouseUp, false);
        window.addEventListener('mousemove', this.handleMouseMove, false);
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    render() {
        let props = this.props,
            width = props.width,
            height = props.height,
            flexGrow = props.flexGrow,
            resizableX = props.resizableX,
            resizableY = props.resizableY,
            style = { flexBasis: width, height, flexGrow };

        return (
            <div className="grid" style={style}>
                {props.children}
                {
                    resizableX &&
                    <div
                        className="x-controller"
                        data-direction="x"
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onMouseMove={this.handleMouseMove}
                    ></div>
                }
                {
                    resizableY &&
                    <div
                        className="y-controller"
                        data-direction="y"
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onMouseMove={this.handleMouseMove}
                    ></div>
                }
            </div>
        );
    }

}