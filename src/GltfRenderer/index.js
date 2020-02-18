import React from 'react';
import WebGLRenderer from '@webglRenderEngine/renderers/WebGLRenderer';
import PerspectiveCamera from '@webglRenderEngine/cameras/PerspectiveCamera';
import OrbitCameraController from '@webglRenderEngine/controllers/OrbitController';
import Box3 from '@webglRenderEngine/math/Box3';
import AnimationMixer from '@webglRenderEngine/animation/AnimationMixer';
import Clock from '@webglRenderEngine/Clock';
import Mesh from '@webglRenderEngine/objects/Mesh';
import WireframeGeometry from '@webglRenderEngine/geometries/WireframeGeometry';
import Scene from '@webglRenderEngine/objects/Scene';
import CameraView from './CameraView';

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
                let cameraViwer = new CameraView(length / 4, length / 8, length / 4);

                // 这里有两种选择：worldMatirx和matrix
                // 使用worldMatrix时需要保证renderer.render内部不再compose matrix
                // 使用matrix时需要构造gltfCamera的所有父辈节点，并且复制它们的matrix
                // 我选择第一种方式，因为简单！
                cameraViwer.applyMatrix(gltfCamera.worldMatrix);
                cameraViwer.autoUpdateMatrix = false;

                scene2.add(cameraViwer);
            });

            renderer.render(scene2, camera);

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