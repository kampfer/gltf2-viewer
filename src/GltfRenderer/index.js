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
    Color,
} from 'webglRenderEngine';

import './index.less';

export default class GltfRenderer extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            gltf: props.gltf
        };

        this.webglCanvas = React.createRef();

        this.webglRenderer = null;

        this._activeCameraType = null;

        this._mixer = null;

        // 保存所有类型的相机和对应的controller，这样切换相机时更流畅：
        // 渲染时使用一种相机，但是控制镜头时两个controller都在更新相机，这样保证相机位置和朝向完全同步
        this._cameras = null;
        this._controllers = null;

        this._clock = null;

    }

    getSceneBox() {
        let gltf = this.props.gltf,
            scene = gltf.scenes[gltf.scene],
            box = new Box3();
        return box.setFromObject(scene);
    }

    setActiveCameraType(type) {
        this._activeCameraType = type;
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

        this._cameras = null;

        // 需要取消事件监听
        if (this._controllers) {
            for(let type in this._controllers) {
                this._controllers[type].destroy();
            }
        }

        if (this._mixer) this._mixer.destroy();
    }

    pause() {
        this._clock.stop();
    }

    resume() {
        this._clock.start();
    }

    renderGltf(gltf, cameraType) {
        console.log('gltf:', gltf);

        // 停止前一个gltf的渲染（停止动画、销毁事件等等）
        this.stopRender();

        let props = this.props,
            scene = gltf.scenes[gltf.scene],
            renderer = this.webglRenderer;

        // 查看模式：mesh和wireframe
        this.setViewType(props.viewType);

        let box = this.getSceneBox(),
            size = box.getSize(),
            length = size.length(),
            center = box.getCenter(),
            canvas = this.webglCanvas.current,
            width = canvas.width,
            height = canvas.height,
            near = length / 100,
            far = length * 10,
            fovy = mathUtils.degToRad(90),
            aspect = width / height,
            HalfFrustumHeihght = Math.tan(fovy / 2) * length,
            HalfFrustumWidth = HalfFrustumHeihght * aspect;

        console.log('Scene Size:', size);
        console.log('length:', length);
        console.log('Scene center:', center);

        // 相机
        this._cameras = {
            [constants.OBJECT_TYPE_PERSPECTIVE_CAMERA]: new PerspectiveCamera(fovy, aspect, near, far),
            [constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA]: new OrthographicCamera(-HalfFrustumWidth, HalfFrustumWidth, HalfFrustumHeihght, -HalfFrustumHeihght, near, far)
        };

        // 相机位置和朝向
        for(let type in this._cameras) {
            let camera = this._cameras[type];
            camera.position.copy(center);
            camera.position.z += length;
            camera.lookAt(center);
            camera.updateWorldMatrix();
        }

        // 镜头控制器
        this._controllers = {};
        for(let cameraType in this._cameras) {
            let camera = this._cameras[cameraType],
                controller = new OrbitController(camera, renderer.domElement);
            controller.target = center.clone();

            let minDistance = near,
                maxDistance = far - length * 5;
            if (camera.type === constants.OBJECT_TYPE_PERSPECTIVE_CAMERA) {
                controller.minDistance = minDistance;
                controller.maxDistance = maxDistance;
            } else if (camera.type === constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA) {
                controller.maxZoom = length / (Math.tan(fovy / 2) * minDistance);
                controller.minZoom = length / (Math.tan(fovy / 2) * maxDistance);
            }

            this._controllers[camera.type] = controller;
        }

        // 动画
        if (gltf.animations && gltf.animations.length > 0) {
            this._mixer = new AnimationMixer([gltf.animations[0]]);
            // 计时器
            this._clock = new Clock();
        }

        // 根据scene的尺寸计算cameraHelper的尺寸
        scene.traverse(function (child) {
            if (child.isCameraHelper === true) {
                let helperSize = new Box3().setFromObject(child).getSize(),
                    scale = new Vec3(0.2, 0.2, 0.2);
                scale.multiply(size).divide(helperSize);
                child.update(scale);
            }
        });

        // 辅助object
        let backgroundScene = new Scene(),
            gridDivisions = 100,
            gridWidth = length / 10,
            gridHelper = new GridHelper(gridWidth * gridDivisions, gridDivisions);
        console.log(`gridWidth = ${gridWidth}`);
        backgroundScene.add(gridHelper);

        this.setActiveCameraType(cameraType);

        const animate = () => {
            this._animationTimer = requestAnimationFrame(animate);

            if (props.beforeRender) props.beforeRender();

            this.webglRenderer.clear();

            if (this._mixer) this._mixer.update(this._clock.getDeltaTime());

            let camera = this._cameras[this._activeCameraType];
            this.webglRenderer.render(backgroundScene, camera);
            this.webglRenderer.render(scene, camera);
            // renderer.render(wireframeScene, camera);

            if (props.afterRender) props.afterRender();
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

        let clearColor = window.getComputedStyle(canvas).backgroundColor;
        this.webglRenderer.setClearColor(new Color(clearColor));

        this.startRenderLater();

    }

    componentWillUnmount() {
        this.stopRender();
        this.webglRenderer.destroy();
    }

    componentDidUpdate(prevProps) {
        let props = this.props;

        if (prevProps.gltf !== props.gltf) {
            this.startRenderLater();
        } else if (prevProps.width !== props.width || prevProps.height !== props.height) {
            this.webglRenderer.setViewport(0, 0, props.width, props.height);
        }
    }

    render() {
        let props = this.props,
            width = props.width,
            height = props.height;
        return (
            <canvas ref={this.webglCanvas} width={width} height={height} className="gltf-renderer"></canvas>
        );
    }

}