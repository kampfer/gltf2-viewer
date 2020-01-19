import React from 'react';

const supportMemory = window.performance && window.performance.memory;

const oneMB = 1024 * 1024;

class Panel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            path : '',
            data: [],
            max: -Infinity,
            min: 0,
            width: 80,
            height: 48,
            style: {
                position: 'absolute',
                left: '0',
                top: '0'
            }
        };

        this.textOffset = {
            left: 0,
            top: 0, 
            width: this.state.width,
            height: 15
        };

        this.diagramOffset = {
            left: 0,
            top: this.textOffset.height,
            width: 80,
            height: this.state.height - this.textOffset.height
        };
    }

    update(v) {
        let max = this.state.max,
            min = this.state.min;
        if (v > max) {
            max = v; 
        }
        if (v < min) {
            min = v;
        }

        let oldData = this.state.data,
            newData = [...oldData, v];
        if (newData.length > 50) {
            newData.shift();
        }

        let path = '',
            diagramOffset = this.diagramOffset,
            bottom = diagramOffset.top + diagramOffset.height,
            right = diagramOffset.left + diagramOffset.width;
        for(let i = newData.length - 1; i >= 0; i--) {
            let x = diagramOffset.left + i,
                item = newData[i],
                y = diagramOffset.top + (max - item) / (max - min) * diagramOffset.height;
            if (i === newData.length - 1) {
                path += `M ${x} ${y}`;
            } else {
                path += `L ${x} ${y}`;
            }
        }
        path += `V ${bottom} H ${right} Z`;

        this.setState({
            data: newData,
            path,
            max,
            min
        });
    }

    render() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="48" style={this.state.style}><path d={this.state.path} /></svg>
        );
    }

}

let beginTime, prevSecond, frames = 0;

export default class Stats extends React.Component {

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.msPanel = React.createRef();
        this.fpsPanel = React.createRef();
        if (supportMemory) {
            this.memPanel = React.createRef();
        }
    }

    now() {
        return (performance || Date).now();
    }

    handleClick() {}

    begin() {
        beginTime = this.now();
    }

    end() {
        let time = this.now();
        // ms
        this.msPanel.current.update(time - beginTime);

        frames++;
        if (time - prevSecond >= 1000) {
            // frames
            this.fpsPanel.current.update( ( frames * 1000 ) / ( time - prevSecond ) );

            prevSecond = time;
            frames = 0;

            if (supportMemory) {
                let memory = performance.memory,
                    cur = memory.usedJSHeapSize / oneMB,
                    max = memory.jsHeapSizeLimit / oneMB;
                // memory
                this.memPanel.update(cur);
            }
        }
    }

    render() {
        return (
            <div onClick={this.handleClick}>
                <Panel ref={this.msPanel} />
                <Panel ref={this.fpsPanel} />
                { supportMemory && <Panel ref={this.memPanel}/> }
            </div>
        );
    }

}