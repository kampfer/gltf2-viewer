import React from 'react';
import {
    WebGLRenderer,
    PerspectiveCamera,
    OrbitController,
    Box3,
    AnimationMixer,
    Clock,
    Mesh,
    WireframeGeometry,
    Scene,
    GridHelper,
    CameraHelper,
} from 'webglRenderEngine';

import './index.less';

let wireframeGeometries = new WeakMap();

export default class GltfRenderer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            gltf: props.gltf
        };

        this.webglCanvas = React.createRef();
    }

    componentDidMount() {
        let canvas = this.webglCanvas.current;
        this.webglRenderer = new WebGLRenderer({ canvas, autoClearColor: false });
        this.webglRenderer.setClearColor([58 / 255, 58 / 255, 58 / 255, 1]);
        this.startRenderLater();
    }

    componentWillUnmount() {
        this.webglRenderer.destroy();
    }

    componentDidUpdate(prevProps) {
        let props = this.props;

        if (prevProps.gltf !== props.gltf ||
            prevProps.width !== props.width ||
            prevProps.height !== props.height) {
            this.startRenderLater();
        }
    }

    stopRender() {
        cancelAnimationFrame(this._animationTimer);
    }

    renderGltf(gltf) {
        console.log('gltf:', gltf);

        let scene = gltf.scenes[gltf.scene],
            renderer = this.webglRenderer,
            self = this,
            box = new Box3(),
            size = box.setFromObject(scene).getSize(),
            center = box.getCenter(),
            length = size.length(),
            canvas = this.webglCanvas.current,
            width = canvas.parentNode.offsetWidth,
            height = canvas.parentNode.offsetHeight,
            camera = new PerspectiveCamera(90 * (Math.PI / 180), width / height, 0.1, length * 100);

        camera.position.copy(center);
        camera.position.z += length;
        camera.lookAt(center);
        camera.updateWorldMatrix();

        if (this.cameraController) {
            this.cameraController.destroy();
        }
        this.cameraController = new OrbitController(camera, renderer.domElement);
        this.cameraController.target = center;
        this.cameraController.panSpeed = window.innerWidth / length;

        if (this.mixer) {
            this.mixer.destroy();
        }
        this.mixer = new AnimationMixer(gltf.animations);

        let clock = new Clock();

        function animate() {
            self._animationTimer = requestAnimationFrame(animate);

            if (self.props.beforeRender) self.props.beforeRender();

            renderer.clear();

            self.mixer.update(clock.getDeltaTime());

            renderer.render(scene, camera);

            // 保存网格、相机等其他辅助对象
            let scene2 = new Scene();

            let selectedNode = scene.getChildByUid(self.props.selectedNode);
            if (selectedNode && selectedNode.geometry) {
                let geometry = selectedNode.geometry,
                    wireframe = wireframeGeometries.get(geometry);
                if (!wireframe) {
                    wireframe = new Mesh(new WireframeGeometry(geometry), selectedNode.material);
                    wireframe.drawMode = 1;
                    selectedNode.worldMatrix.decompose(wireframe.position, wireframe.quaternion, wireframe.scale);
                    wireframeGeometries.set(geometry, wireframe);
                }
                scene2.add(wireframe);
            }

            gltf.cameras.forEach(function (gltfCamera) {
                let cameraHelper = new CameraHelper(gltfCamera);
                scene2.add(cameraHelper);
            });

            let gridHelper = new GridHelper(length * 15, 20, '#ccc');
            scene2.add(gridHelper);

            renderer.render(scene2, camera);

            if (self.props.afterRender) self.props.afterRender();
        }

        animate();
    }

    startRenderLater() {
        clearTimeout(this._startRenderTimer);
        this._startRenderTimer = setTimeout(() => {
            let props = this.props,
                gltf = props.gltf;
            if (gltf) {
                this.stopRender();
                this.webglRenderer.setViewport(0, 0, props.width, props.height);
                this.renderGltf(gltf);
            }
        }, 100);
    }

    render() {
        let props = this.props,
            width = props.width,
            height = props.height;
        return (
            <canvas ref={this.webglCanvas} width={width} height={height} tabIndex="1" className="gltf-renderer"></canvas>
        );
    }

}