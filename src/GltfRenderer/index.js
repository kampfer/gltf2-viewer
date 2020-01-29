import React from 'react';
import WebGLRenderer from '@webglRenderEngine/renderers/WebGLRenderer';
import PerspectiveCamera from '@webglRenderEngine/cameras/PerspectiveCamera';
import OrbitCameraController from '@webglRenderEngine/cameras/OrbitCameraController';
import Box3 from '@webglRenderEngine/math/Box3';
import AnimationMixer from '@webglRenderEngine/animation/AnimationMixer';
import Clock from '@webglRenderEngine/Clock';

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
        this.webglRenderer = new WebGLRenderer({canvas: this.webglCanvas.current});
        this.webglRenderer.setSize(window.innerWidth, window.innerHeight);
        this.webglRenderer.setClearColor([1, 1, 1, 1]);
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

    render() {
        return (
            <canvas ref={this.webglCanvas} style={{display: this.props.hide ? 'none' : ''}}></canvas>
        );
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
        if (cameras.length > 0 && cameras[index]) {
            camera = cameras[index];
        } else {
            camera = new PerspectiveCamera(90 * (Math.PI / 180), window.innerWidth / window.innerHeight, 0.1, length * 100);
            scene.add(camera);
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
            if (self.props.beforeRender) self.props.beforeRender();
            self.mixer.update(clock.getDeltaTime());
            renderer.render(scene, camera);
            if (self.props.afterRender) self.props.afterRender();
            self._animationTimer = requestAnimationFrame(animate);
        }

        animate();
    }

}