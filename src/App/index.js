import React from 'react';
import { GridContainer, Grid } from '../Grid';
import GltfLoader from '../GltfLoader';
import GltfRenderer from '../GltfRenderer';
import GltfNodeViewer from '../GltfNodeViewer';
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
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrop = this.handleDrop.bind(this);

        this.stats = React.createRef();
        this.gltfLoader = React.createRef();
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

    handleDragStart(e) {
        this.gltfLoader.current.handleDragStart(e);
    }

    handleDrop(e) {
        this.gltfLoader.current.handleDrop(e);
    }

    render() {
        return (
            <GridContainer>
                <Grid width={240}>
                    <GltfNodeViewer gltf={this.state.gltf}></GltfNodeViewer>
                </Grid>
                <Grid flexGrow={1}>
                    <Stats ref={this.stats} right={5} top={5} />
                    <GltfLoader ref={this.gltfLoader} onSuccess={this.showGltfRenderer} hide={this.state.hideFileReader} />
                    <GltfRenderer
                        gltf={this.state.gltf}
                        hide={this.state.hideGltfRenderer}
                        beforeRender={() => this.stats.current.begin()}
                        afterRender={() => this.stats.current.end()}
                    />
                </Grid>
            </GridContainer>
        );
    }

}