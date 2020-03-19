import React from 'react';
import {
    WebGLRenderer,
    PerspectiveCamera,
    OrbitController,
    Box3,
    AnimationMixer,
    Clock,
    LineSegments,
    LineBasicMaterial,
    WireframeGeometry,
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

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.setActiveCamera = this.setActiveCamera.bind(this);
        this.getActiveCamera = this.getActiveCamera.bind(this);

        this.activeCamera = null;

        this.cameraController = null;

        this.mixer = null;

        this.commandManager = props.commandManager;

        this.commandManager.registerCommand('renderer.setActiveCamera', this.setActiveCamera);
        this.commandManager.registerCommand('renderer.getActiveCameraType', this.getActiveCamera)

    }

    handleKeyPress(e) {
        if (e.keyCode === 112) {    // p
            this.setActiveCamera(constants.OBJECT_TYPE_PERSPECTIVE_CAMERA);
        } else if (e.keyCode === 111) { // o
            this.setActiveCamera(constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA);
        }
    }

    getActiveCamera() {
        return this.activeCamera && this.activeCamera.type;
    }

    setActiveCamera(type) {
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

    stopRender() {
        cancelAnimationFrame(this._animationTimer);
    }

    renderGltf(gltf) {
        console.log('gltf:', gltf);

        let scene = gltf.scenes[gltf.scene],
            renderer = this.webglRenderer,
            self = this,
            { length, size } = this.setActiveCamera(constants.OBJECT_TYPE_PERSPECTIVE_CAMERA);

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

        // 加上之后内存爆炸！首屏时间也明显增长！
        // let wireframeScene = new Scene(),
        //     wireframeMaterial = new LineBasicMaterial({color: '#eee'});
        // wireframeScene.visible = false;
        // wireframeScene.copy(scene, false);
        // scene.traverse(function (child) {
        //     if (child.geometry) {
        //         let wireframe = new LineSegments(
        //             new WireframeGeometry(child.geometry),
        //             wireframeMaterial
        //         );
        //         wireframe.matrix.copy(child.matrix);
        //         wireframe.position.copy(child.position);
        //         wireframe.quaternion.copy(child.quaternion);
        //         wireframe.scale.copy(child.scale);
        //         wireframeScene.add(wireframe);
        //     } else {
        //         wireframeScene.add(child.clone());
        //     }
        // });

        let clock = new Clock();

        function animate() {
            self._animationTimer = requestAnimationFrame(animate);

            if (self.props.beforeRender) self.props.beforeRender();

            renderer.clear();

            self.mixer.update(clock.getDeltaTime());

            // 不再隐藏上一次选中的对象
            // if (selectedNode) selectedNode.visible = true;
            // selectedNode = scene.getChildByUid(self.props.selectedNode);
            // if (selectedNode && selectedNode.geometry) {
            //     let geometry = selectedNode.geometry,
            //         wireframe = wireframeGeometries.get(geometry);
            //     if (!wireframe) {
            //         wireframe = new LineSegments(new WireframeGeometry(geometry), new LineBasicMaterial({color: 'black'}));
            //         selectedNode.worldMatrix.decompose(wireframe.position, wireframe.quaternion, wireframe.scale);
            //         wireframeGeometries.set(geometry, wireframe);
            //     }
            //     foregroundScene.add(wireframe);
            //     // 隐藏选中的对象，只显示其网格
            //     selectedNode.visible = false;
            // }

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
                this.renderGltf(gltf);
            }
        }, 100);
    }

    componentDidMount() {
        window.addEventListener('keypress', this.handleKeyPress, false);

        let canvas = this.webglCanvas.current;
        this.webglRenderer = new WebGLRenderer({ canvas, autoClearColor: false });
        this.webglRenderer.setClearColor([58 / 255, 58 / 255, 58 / 255, 1]);
        this.startRenderLater();
    }

    componentWillUnmount() {
        window.removeEventListener('keypress', this.handleKeyPress);

        this.webglRenderer.destroy();
        this.cameraController.destroy();
        this.commandManager.unregisterCommand('renderer.setActiveCamera');
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