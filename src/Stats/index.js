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
            min: +Infinity,
            cur: 0
        };

        this.textPadding = [2, 0, 0, 3];

        this.diagramPadding = [0, 3, 3, 3];

        this.textOffset = {
            left: this.textPadding[3],
            top: this.textPadding[0],
            width: props.width - this.textPadding[1] - this.textPadding[3],
            height: props.height / 3 - this.textPadding[0] - this.textPadding[2]
        };

        this.diagramOffset = {
            left: this.diagramPadding[3],
            top: props.height / 3 + this.diagramPadding[0],
            width: props.width - this.diagramPadding[1] - this.diagramPadding[3],
            height: props.height * 2 / 3 - this.diagramPadding[0] - this.diagramPadding[2]
        };
    }

    update(v) {
        let max = this.state.max,
            min = this.state.min;
        if (v > max) {
            max = v; 
        } else if (v < min) {
            min = v;
        }

        let oldData = this.state.data,
            newData = [...oldData, v],
            diagramOffset = this.diagramOffset,
            count = diagramOffset.width;
        if (newData.length > count) {
            newData.shift();
        }

        let path = '',
            bottom = diagramOffset.top + diagramOffset.height,
            right = diagramOffset.left + diagramOffset.width;
        for(let i = count - 1; i >= 0; i--) {
            let item = newData[count - 1 - i];
            if (item === undefined) {
                continue;
            }

            let x = diagramOffset.left + i,
                y = bottom - (item - 0) / (max - 0) * diagramOffset.height;
            if (i === count - 1) {
                path += `M ${x} ${y}`;
            } else {
                path += `L ${x} ${y}`;
            }
        }
        path += `V ${bottom} H ${right} Z`

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
            textOffset = this.textOffset,
            // textPadding = this.textPadding,
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
            fontX = textOffset.left,
            fontY = textOffset.top,
            pathStyle={
                fill: props.fontColor
            },
            min = state.min === Infinity ? '?' : Math.round(state.min),
            max = state.max === -Infinity ? '?' : Math.round(state.max);
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} style={svgStyle}>
                <text x={fontX} y={fontY} style={fontStyle} alignmentBaseline="hanging">
                    {Math.round(state.cur)} ({props.name}) {min}-{max}
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
            left: 5,
            top: 5,
            zIndex: 999
        };
        return (
            <div onClick={this.handleClick} style={style}>
                { this.panels.map( (panel, index) => 
                    <Panel
                        width="80"
                        height="48"
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