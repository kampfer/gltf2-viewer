import React from 'react';
import { GridContainer, Grid } from '../Grid';
import GltfLoader from '../GltfLoader';
import GltfRenderer from '../GltfRenderer';
import GltfNodeViewer from '../GltfNodeViewer';
import GltfNodePropertyViewer from '../GltfNodePropertyViewer';
import Stats from '../Stats';
import TopBar from '../TopBar';
import StatusBar from '../StatusBar';

import './index.less';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            gltf: null,
            selectedNode: undefined,
            hideFileReader: false,
            hideGltfRenderer: true
        };

        this.showFileReader = this.showFileReader.bind(this);
        this.showGltfRenderer = this.showGltfRenderer.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.setSelectedNode = this.setSelectedNode.bind(this);

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

    setSelectedNode(uid) {
        this.setState({selectedNode: uid});
    }

    render() {
        let state = this.state,
            selectedNode = state.selectedNode;
        return (
            <GridContainer vertical>
                <Grid>
                    <TopBar></TopBar>
                </Grid>
                <Grid>
                    <div style={{height: 3}}></div>
                </Grid>
                <Grid flexGrow={1}>
                    <GridContainer>
                        <Grid width={300}>
                            <GridContainer vertical>
                                <Grid>
                                    <GltfNodeViewer
                                        gltf={this.state.gltf}
                                        onSelectNode={this.setSelectedNode}
                                        selectedNode={selectedNode}
                                    ></GltfNodeViewer>
                                </Grid>
                                <Grid>
                                    <div style={{height: 3}}></div>
                                </Grid>
                                <Grid flexGrow={1}>
                                    <GltfNodePropertyViewer gltf={this.state.gltf} selectedNode={selectedNode}></GltfNodePropertyViewer>
                                </Grid>
                            </GridContainer>
                        </Grid>
                        <Grid>
                            <div style={{width: 3}}></div>
                        </Grid>
                        <Grid flexGrow={1}>
                            <div style={{width: '100%', height: '100%'}} className="bg-color-black-1 border-radius-5" onDragOver={this.handleDragStart} onDrop={this.handleDrop}>
                                <Stats ref={this.stats} right={5} top={5} />
                                <GltfLoader ref={this.gltfLoader} onSuccess={this.showGltfRenderer} hide={this.state.hideFileReader} />
                                <GltfRenderer
                                    gltf={this.state.gltf}
                                    hide={this.state.hideGltfRenderer}
                                    beforeRender={() => this.stats.current.begin()}
                                    afterRender={() => this.stats.current.end()}
                                />
                            </div>
                        </Grid>
                    </GridContainer>
                </Grid>
                <Grid>
                    <div style={{height: 3}}></div>
                </Grid>
                <Grid>
                    <StatusBar></StatusBar>
                </Grid>
            </GridContainer>
        );
    }

}