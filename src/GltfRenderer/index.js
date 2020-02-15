import React from 'react';
import WebGLRenderer from '@webglRenderEngine/renderers/WebGLRenderer';
import PerspectiveCamera from '@webglRenderEngine/cameras/PerspectiveCamera';
import OrbitCameraController from '@webglRenderEngine/cameras/OrbitCameraController';
import Box3 from '@webglRenderEngine/math/Box3';
import AnimationMixer from '@webglRenderEngine/animation/AnimationMixer';
import Clock from '@webglRenderEngine/Clock';
import Mesh from '@webglRenderEngine/Mesh';
import WireframeGeometry from '@webglRenderEngine/geometries/WireframeGeometry';

import './index.less';

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

        let width = canvas.parentNode.offsetWidth,
            height = canvas.parentNode.offsetHeight;
        this.webglRenderer.setSize(width, height);

        this.webglRenderer.setClearColor([58 / 255, 58 / 255, 58 / 255, 1]);
    }

    componentWillUnmount() {
        this.webglRenderer.destroy();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.gltf === this.props.gltf) {
            return;
        }

        let gltf = this.props.gltf;
        if (gltf) {
            this.stopRender();
            this.renderGltf(gltf);
        }
    }

    stopRender() {
        cancelAnimationFrame(this._animationTimer);
    }

    renderGltf(gltf) {
        console.log('gltf:', gltf);

        let scene = gltf.scenes[gltf.scene],
            renderer = this.webglRenderer,
            self = this;

        let cameras = []
        scene.children.forEach((child) => {
            if (child.type === 'PerspectiveCamera' || child.type === 'OrthographicCamera') {
                cameras.push(child);
            }
        });

        let box = new Box3(),
            size = box.setFromObject(scene).getSize(),
            center = box.getCenter(),
            length = size.length(),
            camera = null,
            index = 0;
        if (cameras.length > 0) {
            let theirCamera = cameras[index];
            if (theirCamera.tyep === 'PerspectiveCamera') {
                camera = new PerspectiveCamera(theirCamera.fovy, theirCamera.aspect, theirCamera.near, theirCamera.far);
            } else if (theirCamera.type === 'OrthographicCamera') {
                //
            }
        } else {
            let canvas = this.webglCanvas.current,
                width = canvas.parentNode.offsetWidth,
                height = canvas.parentNode.offsetHeight;
            camera = new PerspectiveCamera(90 * (Math.PI / 180), width / height, 0.1, length * 100);
        }
        camera.position.copy(center);
        camera.position.z += length;
        camera.lookAt(center);

        if (this.cameraController) {
            this.cameraController.destroy();
        }
        this.cameraController = new OrbitCameraController(camera, renderer.domElement);
        this.cameraController.target = center;

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

            camera.updateWorldMatrix();

            renderer.render(scene, camera);

            let selectedNode = scene.getChildByUid(self.props.selectedNode);
            if (selectedNode && selectedNode.geometry) {
                let wireframe = new Mesh(new WireframeGeometry(selectedNode.geometry), selectedNode.material);
                selectedNode.worldMatrix.decompose(wireframe.position, wireframe.quaternion, wireframe.scale);
                wireframe.drawMode = 1;
                renderer.render(wireframe, camera);
            }

            if (self.props.afterRender) self.props.afterRender();
        }

        animate();
    }

    render() {
        let props = this.props,
            style = {
                display: props.hide ? 'none' : 'block',
                borderRadius: '5px'
            };
        return (
            <canvas ref={this.webglCanvas} style={style}></canvas>
        );
    }

}