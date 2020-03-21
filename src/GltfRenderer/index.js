import React from 'react';
import {
    WebGLRenderer,
    PerspectiveCamera,
    OrbitController,
    Box3,
    AnimationMixer,
    Clock,
    Scene,
    GridHelper,
    Vec3,
    OrthographicCamera,
    mathUtils,
    constants,
} from 'webglRenderEngine';

import './index.less';

export default class GltfRenderer extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            gltf: props.gltf
        };

        this.webglCanvas = React.createRef();

        this.activeCamera = null;

        this.cameraController = null;

        this.mixer = null;

    }

    getActiveCamera() {
        return this.activeCamera && this.activeCamera.type;
    }

    setActiveCameraType(type) {
        let gltf = this.props.gltf,
            oldActiveCamera = this.activeCamera,
            oldCameraController = this.cameraController,
            activeCamera,
            target;

        if (!gltf) return;

        if (oldActiveCamera && oldActiveCamera.type === type) return;

        let scene = gltf.scenes[gltf.scene],
            box = new Box3(),
            size = box.setFromObject(scene).getSize(),
            center = box.getCenter(),
            length = size.length(),
            canvas = this.webglCanvas.current,
            width = canvas.width,
            height = canvas.height,
            near = 0.1,
            far = length * 100,
            fovy = mathUtils.degToRad(90),
            aspect = width / height;

        if (type === constants.OBJECT_TYPE_PERSPECTIVE_CAMERA) {
            activeCamera = new PerspectiveCamera(fovy, aspect, near, far);
        } else if (type === constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA) {
            let sizeY = Math.tan(fovy / 2) * length,
                sizeX = sizeY * aspect;
            activeCamera = new OrthographicCamera(-sizeX, sizeX, sizeY, -sizeY, near, far);
        }

        if (oldCameraController) {
            target = oldCameraController.target;
        } else {
            target = center;
        }

        if (oldActiveCamera) {
            activeCamera.position.copy(oldActiveCamera.position);
            activeCamera.quaternion.copy(oldActiveCamera.quaternion);
            activeCamera.scale.copy(oldActiveCamera.scale);
            activeCamera.lookAt(target);
            activeCamera.updateWorldMatrix();
        } else {
            activeCamera.position.copy(center);
            activeCamera.position.z += length;
            activeCamera.lookAt(center);
            activeCamera.updateWorldMatrix();
        }

        this.activeCamera = activeCamera;

        // controller绑定了事件，必须destroy
        if (oldCameraController) {
            oldCameraController.destroy();
        }
        this.cameraController = new OrbitController(activeCamera, this.webglRenderer.domElement);
        this.cameraController.target = target;

        return {
            activeCamera,
            box,
            size,
            center,
            length,
        };
    }

    setViewType(type) {

        let gltf = this.props.gltf,
            scene = gltf.scenes[gltf.scene];

        scene.traverse(function (child) {
            if (child.material) {
                if (type === 'mesh') {
                    child.material.wireframe = false;
                } else if (type === 'wireframe') {
                    child.material.wireframe = true;
                }
            }
        });

    }

    stopRender() {
        cancelAnimationFrame(this._animationTimer);
    }

    renderGltf(gltf, cameraType) {
        console.log('gltf:', gltf);

        let props = this.props,
            scene = gltf.scenes[gltf.scene],
            renderer = this.webglRenderer,
            self = this,
            { length, size } = this.setActiveCameraType(cameraType);

        this.setViewType(props.viewType);

        if (this.mixer) {
            this.mixer.destroy();
        }
        this.mixer = new AnimationMixer(gltf.animations);

        scene.traverse(function (child) {
            if (child.isCameraHelper === true) {
                let helperSize = new Box3().setFromObject(child).getSize(),
                    scale = new Vec3(0.2, 0.2, 0.2);
                scale.multiply(size).divide(helperSize);
                child.update(scale);
            }
        });

        let backgroundScene = new Scene(),
            gridHelper = new GridHelper(length * 15, 20, '#ccc');
        backgroundScene.add(gridHelper);

        let clock = new Clock();

        function animate() {
            self._animationTimer = requestAnimationFrame(animate);

            if (self.props.beforeRender) self.props.beforeRender();

            renderer.clear();

            self.mixer.update(clock.getDeltaTime());

            renderer.render(backgroundScene, self.activeCamera);
            renderer.render(scene, self.activeCamera);
            // renderer.render(wireframeScene, camera);

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
                this.renderGltf(gltf, props.activeCameraType);
            }
        }, 100);
    }

    componentDidMount() {
        let canvas = this.webglCanvas.current;
        this.webglRenderer = new WebGLRenderer({ canvas, autoClearColor: false });
        this.webglRenderer.setClearColor([58 / 255, 58 / 255, 58 / 255, 1]);
        this.startRenderLater();
    }

    componentWillUnmount() {
        this.webglRenderer.destroy();
        this.cameraController.destroy();
    }

    componentDidUpdate(prevProps) {
        let props = this.props;

        if (prevProps.gltf !== props.gltf ||
            prevProps.width !== props.width ||
            prevProps.height !== props.height) {
            this.startRenderLater();
        }
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