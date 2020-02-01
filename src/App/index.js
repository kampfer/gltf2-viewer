import React from 'react';
import GltfLoader from '../GltfLoader';
import GltfRenderer from '../GltfRenderer';
import Stats from '../Stats';

import './index.less';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            gltf: null,
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

    showGltfRenderer(gltf) {
        this.setState({
            gltf,
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
            <div className="container">
                <div className="side"></div>
                <div className="main">
                    <Stats ref={this.stats} right={5} top={5}/>
                    <GltfLoader onSuccess={this.showGltfRenderer} hide={this.state.hideFileReader} />
                    <GltfRenderer
                        gltf={this.state.gltf}
                        hide={this.state.hideGltfRenderer}
                        beforeRender={() => this.stats.current.begin()}
                        afterRender={() => this.stats.current.end()}
                    />
                </div>
            </div>
        );
    }

}