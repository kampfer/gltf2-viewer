import React from 'react';
import { GridContainer, Grid } from '../Grid';
import GltfLoader from '../GltfLoader';
import GltfRenderer from '../GltfRenderer';
import GltfNodeViewer from '../GltfNodeViewer';
import GltfNodePropertyViewer from '../GltfNodePropertyViewer';
import Stats from '../Stats';
import TopBar from '../TopBar';
import StatusBar from '../StatusBar';
import ResizeHelper from '../ResizeHelper';
import debounce from '../utils/debounce';
import KeyBinder from '../KeyBinder';
import { commandManager } from '../commands';
import { constants } from 'webglRenderEngine';

import './index.less';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        let sideBarWith = 240,
            nodeViewerHeight = 560,
            winWidth = window.innerWidth,
            winHeight = window.innerHeight,
            padding = 3;

        this.state = {
            gltf: null,
            selectedNode: undefined,
            activeCameraType: constants.OBJECT_TYPE_PERSPECTIVE_CAMERA,
            viewType: null,
            hideFileReader: false,
            sideBarWith: sideBarWith,
            nodeViewerHeight: nodeViewerHeight,
            rendererWidth: winWidth - sideBarWith - padding,
            rendererHeight: winHeight - 30 - padding - 20 -padding
        };

        this.renderGltf = this.renderGltf.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleWinResize = debounce(this.handleWinResize, 100).bind(this);

        this.setSelectedNode = this.setSelectedNode.bind(this);
        this.changeNodeViewerHeight = this.changeNodeViewerHeight.bind(this);
        this.changeSideBarWidth = this.changeSideBarWidth.bind(this);
        this.setViewType = this.setViewType.bind(this);
        this.setActiveCameraType = this.setActiveCameraType.bind(this);

        this.stats = React.createRef();
        this.gltfLoader = React.createRef();
        this.rendererRef = React.createRef();
    }

    renderGltf(gltf) {
        this.setState({
            gltf,
            selectedNode: undefined,
            hideFileReader: true
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

    setViewType(type) {
        let renderer = this.rendererRef.current;
        if (renderer) {
            renderer.setViewType(type);
            this.setState({ viewType: type });
        }
    }

    setActiveCameraType(type) {
        let renderer = this.rendererRef.current;
        if (renderer) {
            renderer.setActiveCameraType(type);
            this.setState({ activeCameraType: type });
        }
    }

    setSelectedNode(uid) {
        this.setState({selectedNode: uid});
    }

    changeSideBarWidth({ deltaSize }) {
        let size = this.state.sideBarWith;
        this.setState({sideBarWith: size + deltaSize});
    }

    changeNodeViewerHeight({ deltaSize }) {
        let size = this.state.nodeViewerHeight;
        this.setState({nodeViewerHeight: size + deltaSize});
    }

    handleWinResize() {
        let state = this.state,
            winWidth = window.innerWidth,
            winHeight = window.innerHeight,
            padding = 3,
            rendererWidth = winWidth - state.sideBarWith - padding,
            rendererHeight = winHeight - 30 - padding - 20 -padding;

        this.setState({rendererWidth, rendererHeight});
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWinResize);

        commandManager.registerCommand('renderer.setActiveCameraType', this.setActiveCameraType);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWinResize);

        commandManager.unregisterCommand('renderer.setActiveCameraType');
    }

    render() {

        let state = this.state,
            gltf = state.gltf,
            selectedNode = state.selectedNode;

        return (
            <KeyBinder>
                <GridContainer vertical>
                    <Grid>
                        <TopBar activeCameraType={state.activeCameraType} viewType={state.viewType}></TopBar>
                    </Grid>
                    <Grid flexGrow={1}>
                        <GridContainer>
                            <Grid width={state.sideBarWith}>
                                <ResizeHelper resizeX onResize={this.changeSideBarWidth}>
                                    <GridContainer vertical>
                                        <Grid>
                                            <ResizeHelper resizeY onResize={this.changeNodeViewerHeight}>
                                                <GltfNodeViewer height={state.nodeViewerHeight}
                                                    gltf={state.gltf}
                                                    onSelectNode={this.setSelectedNode}
                                                    selectedNode={selectedNode}
                                                ></GltfNodeViewer>
                                            </ResizeHelper>
                                        </Grid>
                                        <Grid flexGrow={1}>
                                            <GltfNodePropertyViewer
                                                gltf={state.gltf}
                                                selectedNode={selectedNode}
                                                height={window.innerHeight - state.nodeViewerHeight - 30 - 20 - 3 * 2}
                                            ></GltfNodePropertyViewer>
                                        </Grid>
                                    </GridContainer>
                                </ResizeHelper>
                            </Grid>
                            <Grid flexGrow={1}>
                                <div className="bg-color-black-1 border-radius-5" style={{position: 'relative'}} onDrop={this.handleDrop}>
                                    <Stats ref={this.stats} right={5} top={30 + 3 + 3} />
                                    <GltfLoader ref={this.gltfLoader} onSuccess={this.renderGltf} hide={this.state.hideFileReader} />
                                    <GltfRenderer
                                        ref={this.rendererRef}
                                        gltf={state.gltf}
                                        selectedNode={state.selectedNode}
                                        hide={this.state.hideGltfRenderer}
                                        beforeRender={() => this.stats.current.begin()}
                                        afterRender={() => this.stats.current.end()}
                                        width={state.rendererWidth}
                                        height={state.rendererHeight}
                                        activeCameraType={state.activeCameraType}
                                        viewType={state.viewType}
                                    />
                                </div>
                            </Grid>
                        </GridContainer>
                    </Grid>
                    <Grid>
                        <StatusBar gltf={gltf}></StatusBar>
                    </Grid>
                </GridContainer>
            </KeyBinder>
        );

    }

}