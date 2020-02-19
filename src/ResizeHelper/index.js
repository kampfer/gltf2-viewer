import React from 'react';

import './index.less';

export default class ResizeHelper extends React.Component {

    constructor(props) {
        super(props);

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    handleMouseDown(e) {
        this._resizing = true;
        this._resizeDirection = e.target.dataset.direction;
        this._lastPosition = this._getMousePosition(e);
    }

    handleMouseUp() {
        this._resizing = false;
    }

    handleMouseMove(e) {

        if (!this._resizing) return;

        let mousePositon = this._getMousePosition(e),
            deltaSize = mousePositon - this._lastPosition,
            direction = this._resizeDirection,
            resizeHandler = this.props.onResize;

        if (resizeHandler) resizeHandler({ deltaSize, direction });

        this._lastPosition = mousePositon;

    }

    _getMousePosition(e) {
        if (this._resizeDirection === 'x') {
            return e.clientX;
        } else if (this._resizeDirection === 'y') {
            return e.clientY;
        }
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
            resizeX = props.resizeX,
            resizeY = props.resizeY;

        return (
            <div className="resize-helper">
                {props.children}
                {
                    resizeX &&
                    <div
                        className="resize-helper-x"
                        data-direction="x"
                        onMouseDown={this.handleMouseDown}
                    ></div>
                }
                {
                    resizeY &&
                    <div
                        className="resize-helper-y"
                        data-direction="y"
                        onMouseDown={this.handleMouseDown}
                    ></div>
                }
            </div>
        )

    }

}