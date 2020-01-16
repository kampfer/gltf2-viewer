import React from 'react';
import WebGLRenderer from '@webglRenderEngine/renderers/WebGLRenderer';
import PerspectiveCamera from '@webglRenderEngine/cameras/PerspectiveCamera';
import OrbitCameraController from '@webglRenderEngine/cameras/OrbitCameraController';
import Box3 from '@webglRenderEngine/math/Box3';
import GLTFLoader from './GLTFLoader';

import './index.less';

export default class Gltf2Viewer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            files: props.files
        };

        this.gltfLoader = new GLTFLoader(); 

        this.webglCanvas = React.createRef();
    }

    componentDidMount() {
        this.webglRenderer = new WebGLRenderer({canvas: this.webglCanvas.current});
        this.webglRenderer.setSize(window.innerWidth, window.innerHeight);
        this.webglRenderer.setClearColor([1, 1, 1, 1]);
    }

    componentWillUnmount() {
        this.webglRenderer.destory();
    }

    componentDidUpdate() {
        let files = this.props.files;
        if (files) {
            console.log(files);

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
            
            let gltfURL = gltfFile,
                blobURLs = [];
            if (typeof gltfURL !== 'string') {
                gltfURL = URL.createObjectURL(gltfFile);
                blobURLs.push(gltfURL);
            }

            this.gltfLoader
                .load(gltfURL)
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
            <canvas ref={this.webglCanvas}></canvas>
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

        let cameraController = new OrbitCameraController(camera, renderer.domElement);
        cameraController.target = center;

        function animate() {
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();
    }

}