import React from 'react';
import WebGLRenderer from '@webglRenderEngine/renderers/WebGLRenderer';
import PerspectiveCamera from '@webglRenderEngine/cameras/PerspectiveCamera';
import OrbitCameraController from '@webglRenderEngine/cameras/OrbitCameraController';
import Box3 from '@webglRenderEngine/math/Box3';
import GLTFLoader from './GLTFLoader';
import path from 'path';

import './index.less';

export default class GltfRenderer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            files: props.files
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
        if (prevProps.files === this.props.files) {
            return;
        }

        let files = this.props.files;
        if (files) {
            let gltfFile,
                fileMap = {};
            // e.dataTransfer.files是一个filelist不是数组，必须手动遍历。
            for(let i = 0, l = files.length; i < l; i++) {
                let file = files[i];
                fileMap[file.name] = file;

                if (file.name.match(/\.(gltf|glb)$/)) {
                    gltfFile = file;
                }
            }

            if (!gltfFile) {
                alert('请上传.gltf或.glb文件！');
                return;
            }
            
            let blobURLs = [];
            // 每次gltf变化之后loader需要重置，清空缓存等状态。直接创建新的实例最方便。
            this.gltfLoader = new GLTFLoader();
            this.gltfLoader.setURLModifier(function (url) {
                if (url in fileMap) {
                    let blobUrl = URL.createObjectURL(fileMap[url]);
                    blobURLs.push(blobUrl);
                    return blobUrl;
                }
                return url;
            });
            // this.gltfLoader.setBaseUrl(path.dirname(gltfURL));

            this.gltfLoader
                .load(gltfFile.name)
                .then((gltf) => {
                    this.renderGltf(gltf);
                });

            blobURLs.forEach(function (url) {
                URL.revokeObjectURL(url);
            });
        }
    }

    render() {
        return (
            <canvas ref={this.webglCanvas} style={{display: this.props.hide ? 'none' : ''}}></canvas>
        )
    }

    renderGltf(gltf) {
        console.log('gltf:', gltf);

        let scene = gltf.scenes[gltf.scene],
            renderer = this.webglRenderer;

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

        function animate() {
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();
    }

}