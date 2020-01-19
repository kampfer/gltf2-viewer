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
            cur: 0
        };

        this.textOffset = {
            left: 0,
            top: 9, 
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
            cur: v,
            data: newData,
            path,
            max,
            min
        });
    }

    render() {
        let props = this.props,
            state = this.state,
            svgStyle = {
                display: props.hide ? 'none' : '',
                backgroundColor: props.backgroundColor
            },
            fontStyle= {
                fill: props.fontColor,
                fontSize: 9,
                fontFamily: 'Helvetica,Arial,sans-serif',
                fontWeight: 'bold'
            },
            pathStyle={
                fill: props.fontColor
            };
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="48" style={svgStyle}>
                <text x={this.textOffset.left} y={this.textOffset.top} style={fontStyle}>
                    {Math.round(state.cur)} ({props.name}) {Math.round(state.min)}-{Math.round(state.max)}
                </text>
                <path d={state.path} style={pathStyle} />
            </svg>
        );
    }

}

let beginTime, prevSecond = 0, frames = 0;

export default class Stats extends React.Component {

    constructor(props) {
        super(props);

        this.state = { currentPanel: 0 };

        this.handleClick = this.handleClick.bind(this);

        this.panels = [
            {
                name: 'FPS',
                ref: React.createRef(),
                backgroundColor: '#002',
                fontColor: '#0ff'
            },
            {
                name: 'MS',
                ref: React.createRef(),
                backgroundColor: '#020',
                fontColor: '#0f0'
            },
            
        ];
        if (supportMemory) {
            this.panels.push({
                name: 'MB',
                ref: React.createRef(),
                backgroundColor: '#201',
                fontColor: '#f08'
            });
        }
    }

    now() {
        return (performance || Date).now();
    }

    handleClick() {
        let index = this.state.currentPanel;
        this.selectPanel(++index % this.panels.length);
    }

    begin() {
        beginTime = this.now();
    }

    end() {
        let msPanel = this.getPannelByName('MS').ref.current,
            fpsPanel = this.getPannelByName('FPS').ref.current,
            mbPanel = this.getPannelByName('MB').ref.current;

        let time = this.now();
        // ms
        msPanel.update(time - beginTime);

        frames++;
        if (time - prevSecond >= 1000) {
            // frames
            fpsPanel.update( ( frames * 1000 ) / ( time - prevSecond ) );

            prevSecond = time;
            frames = 0;

            if (supportMemory) {
                let memory = performance.memory,
                    cur = memory.usedJSHeapSize / oneMB,
                    max = memory.jsHeapSizeLimit / oneMB;
                // memory
                mbPanel.update(cur);
            }
        }
    }

    selectPanel(index) {
        this.setState({ currentPanel: index });
    }

    getPannelByName(name) {
        for(let i = 0, l = this.panels.length; i < l; i++) {
            let panel = this.panels[i];
            if (panel.name === name) {
                return panel;
            }
        }
    }

    render() {
        console.log('stats render');
        let style = {
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 999
        };
        return (
            <div onClick={this.handleClick} style={style}>
                { this.panels.map( (panel, index) => 
                    <Panel
                        key={panel.name}
                        ref={panel.ref}
                        name={panel.name}
                        backgroundColor={panel.backgroundColor}
                        fontColor={panel.fontColor}
                        hide={index !== this.state.currentPanel}
                    />
                )}
            </div>
        );
    }

}