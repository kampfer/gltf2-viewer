import React from 'react';
import FileReader from './FileReader';
import GltfRenderer from './GltfRenderer';
import Stats from './Stats';

import './main.less';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            files: null,
            hideFileReader: false,
            hideGltfRenderer: true
        };

        this.showFileReader = this.showFileReader.bind(this);
        this.showGltfRenderer = this.showGltfRenderer.bind(this);

        this.stats = React.createRef();
    }

    showFileReader(e) {
        this.stopDefault(e);
        this.setState({
            hideFileReader: false,
            hideGltfRenderer: true
        });
    }

    showGltfRenderer(files) {
        this.setState({
            files,
            hideFileReader: true,
            hideGltfRenderer: false
        });
    }

    stopDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        return (
            <div
                className="app"
                onDrag={this.stopDefault}
                onDragOver={this.stopDefault}
                onDragStart={this.showFileReader}
                onDragEnd={this.stopDefault}
                onDragEnter={this.showFileReader}
                onDragLeave={this.stopDefault}
                onDrop={this.stopDefault}
            >
                <Stats ref={this.stats}/>
                <FileReader onSuccess={this.showGltfRenderer} hide={this.state.hideFileReader} />
                <GltfRenderer
                    files={this.state.files}
                    hide={this.state.hideGltfRenderer}
                    beforeRender={() => this.stats.current.begin()}
                    afterRender={() => this.stats.current.end()}
                />
            </div>
        );
    }

}