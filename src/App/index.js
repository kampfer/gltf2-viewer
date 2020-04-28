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
import KeyBindingTip from './KeybindingTip';
import { AppStateContext } from './contexts';

import './index.less';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            gltf: null,
            selectedNode: undefined,
            showFPS: false,
            activeCameraType: constants.OBJECT_TYPE_PERSPECTIVE_CAMERA,
            viewType: 'mesh',
            hideFileReader: false,
            activatedAnimationClips: [],
            playAnimation: this.playAnimation.bind(this),
            stopAnimation: this.stopAnimation.bind(this),
            stopAllAnimations: this.stopAllAnimations.bind(this),
            ...this.calculateLayout(),
        };

        this.handleDropOver = this.handleDropOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleWinResize = debounce(this.handleWinResize, 100).bind(this);

        this.renderGltf = this.renderGltf.bind(this);
        this.setSelectedNode = this.setSelectedNode.bind(this);
        this.changeNodeViewerHeight = this.changeNodeViewerHeight.bind(this);
        this.changeSideBarWidth = this.changeSideBarWidth.bind(this);
        this.setViewType = this.setViewType.bind(this);
        this.setActiveCameraType = this.setActiveCameraType.bind(this);
        this.open = this.open.bind(this);
        this.openUrl = this.openUrl.bind(this);

        this.stats = React.createRef();
        this.gltfLoaderRef = React.createRef();
        this.rendererRef = React.createRef();
    }

    renderGltf(gltf) {
        if (!gltf) return;
        this.setState({
            gltf,
            selectedNode: undefined,
            hideFileReader: true,
            activeCameraType: constants.OBJECT_TYPE_PERSPECTIVE_CAMERA,
            viewType: 'mesh',
            activatedAnimationClips: gltf.animations && gltf.animations.length > 0 ? [gltf.animations[0]] : []
        });
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    // Typically, an application will include a dragover event handler on the drop target element
    // and that handler will turn off the browser's default drag behavior.
    handleDropOver(e) {
        e.preventDefault();
    }

    handleDrop(e) {
        e.preventDefault();

        let gltfLoader = this.gltfLoaderRef.current;
        if (gltfLoader) {
            gltfLoader.loadGltfFromFiles(e.dataTransfer.files).then(this.renderGltf);
        }
    }

    playAnimation(clip) {
        let renderer = this.rendererRef.current;
        if (renderer) {
            renderer.playClip(clip);
            let activatedAnimationClips = this.state.activatedAnimationClips;
            this.setState({activatedAnimationClips: [...activatedAnimationClips, clip]});
        }
    }

    stopAllAnimations() {

        let renderer = this.rendererRef.current;

        if (renderer) {
            renderer.stopAllClips();
            this.setState({activatedAnimationClips: []});
        }

    }

    stopAnimation(clip) {
        let renderer = this.rendererRef.current;
        if (renderer) {
            renderer.stopClip(clip);
            let activatedAnimationClips = this.state.activatedAnimationClips;
            let index = activatedAnimationClips.indexOf(clip);
            if (index >= 0) activatedAnimationClips.splice(index, 1);
            this.setState({activatedAnimationClips: [...activatedAnimationClips]});
        }
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

    open() {
        let gltfLoader = this.gltfLoaderRef.current;
        if (gltfLoader) {
            gltfLoader.open().then(this.renderGltf);
        }
    }

    openUrl() {
        let gltfLoader = this.gltfLoaderRef.current;
        if (gltfLoader) {
            gltfLoader.openUrl().then(this.renderGltf);
        }
    }

    setSelectedNode(uid) {
        this.setState({selectedNode: uid});
    }

    changeSideBarWidth({ deltaSize }) {
        let sideBarWidth = this.state.sideBarLayout.width + deltaSize;
        this.setState(this.calculateLayout({ sideBarWidth }));
    }

    changeNodeViewerHeight({ deltaSize }) {
        let nodeViewerHeight = this.state.nodeViewerLayout.height + deltaSize;
        this.setState(this.calculateLayout({ nodeViewerHeight }));
    }

    handleWinResize() {
        let sideBarWidth = this.state.sideBarLayout.width;
        let nodeViewerHeight = this.state.nodeViewerLayout.height;
        this.setState(this.calculateLayout({sideBarWidth, nodeViewerHeight}));
    }

    calculateLayout({
        topBarHeight = 30,
        statusBarHeight = 20,
        sideBarWidth = 240,
        nodeViewerHeight = 560
    } = {}) {
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        return {
            // topBarLayout: { height: topBarHeight },
            // statusBarLayout: { height: statusBarHeight },
            sideBarLayout: {width: sideBarWidth },
            rendererLayout: { width: winWidth - sideBarWidth, height: winHeight - topBarHeight - statusBarHeight},
            nodeViewerLayout: { height: nodeViewerHeight},
            nodePropertyViewerLayout: { height: winHeight - topBarHeight - statusBarHeight - nodeViewerHeight}
        };
    }

    disableContextMenu(e) {
        e.preventDefault();
    }

    componentDidMount() {
        if (location.search.indexOf('showFPS=true') >= 0) this.setState({ showFPS: true });

        window.addEventListener('resize', this.handleWinResize);
        window.addEventListener('contextmenu', this.disableContextMenu);

        commandManager.registerCommand('renderer.setActiveCameraType', this.setActiveCameraType);
        commandManager.registerCommand('renderer.setViewType', this.setViewType);
        commandManager.registerCommand('open', this.open);
        commandManager.registerCommand('openUrl', this.openUrl);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWinResize);
        window.removeEventListener('contextmenu', this.disableContextMenu);

        commandManager.unregisterCommand('renderer.setActiveCameraType');
        commandManager.unregisterCommand('renderer.setViewType');
        commandManager.unregisterCommand('open');
        commandManager.unregisterCommand('openUrl');
    }

    render() {

        let state = this.state,
            gltf = state.gltf,
            selectedNode = state.selectedNode;

        return (
            <AppStateContext.Provider value={state}>
                <KeyBinder>
                    <GridContainer vertical>
                        <Grid>
                            <TopBar activeCameraType={state.activeCameraType} viewType={state.viewType}></TopBar>
                        </Grid>
                        <Grid flexGrow={1}>
                            <GridContainer>
                                <Grid width={state.sideBarLayout.width}>
                                    <ResizeHelper resizeX onResize={this.changeSideBarWidth}>
                                        <GridContainer vertical>
                                            <Grid>
                                                <ResizeHelper resizeY onResize={this.changeNodeViewerHeight}>
                                                    <GltfNodeViewer height={state.nodeViewerLayout.height}
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
                                                    height={state.nodePropertyViewerLayout.height}
                                                ></GltfNodePropertyViewer>
                                            </Grid>
                                        </GridContainer>
                                    </ResizeHelper>
                                </Grid>
                                <Grid flexGrow={1}>
                                    <div onDrop={this.handleDrop} onDragOver={this.handleDropOver}>
                                        { !state.gltf && <KeyBindingTip></KeyBindingTip> }
                                        { state.showFPS && <Stats ref={this.stats} right={5} top={30 + 3 + 3} /> }
                                        <GltfLoader ref={this.gltfLoaderRef} onSuccess={this.renderGltf} hide={this.state.hideFileReader} />
                                        <GltfRenderer
                                            ref={this.rendererRef}
                                            gltf={state.gltf}
                                            selectedNode={state.selectedNode}
                                            hide={this.state.hideGltfRenderer}
                                            beforeRender={ state.showFPS && (() => this.stats.current.begin()) }
                                            afterRender={ state.showFPS && (() => this.stats.current.end()) }
                                            width={state.rendererLayout.width}
                                            height={state.rendererLayout.height}
                                            activeCameraType={state.activeCameraType}
                                            viewType={state.viewType}
                                            activatedAnimationClips={state.activatedAnimationClips}
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
            </AppStateContext.Provider>
        );

    }

}