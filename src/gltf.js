import './main.less';

import WebGLRenderer from '@webglRenderEngine/renderers/WebGLRenderer';
import PerspectiveCamera from '@webglRenderEngine/cameras/PerspectiveCamera';
import GLTFLoader from './GLTFLoader';
import OrbitCameraController from '@webglRenderEngine/cameras/OrbitCameraController';
import Box3 from '@webglRenderEngine/math/Box3';

let glTFLoader = new GLTFLoader(),
    gltfPath = location.search.match(/\?gltf=(.*)/);

if (gltfPath) {
    gltfPath = gltfPath[1];
} else {
    gltfPath = './gltf2/Triangle/Triangle.gltf';
}

// https://gltf-viewer.donmccurdy.com/
// https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0
// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#properties-reference
glTFLoader.load(gltfPath)
    .then(function (gltf) {
        console.log('gltf:', gltf);

        let scene = gltf.scenes[gltf.scene];

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

        let renderer = new WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor([1, 1, 1, 1]);
        document.body.appendChild(renderer.domElement);

        let cameraController = new OrbitCameraController(camera, renderer.domElement);
        cameraController.target = center;

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        animate();
    })
    .catch(function (error) {
        console.log(error);
    });
