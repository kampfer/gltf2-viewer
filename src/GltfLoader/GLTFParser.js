import {
    Scene,
    Mesh,
    Geometry,
    Material,
    BufferAttribute,
    GraphObject,
    PerspectiveCamera,
    OrthographicCamera,
    Mat4,
    AnimationClip,
    NumberKeyFrameTrack,
    VectorKeyFrameTrack,
    QuaternionKeyFrameTrack,
    constants,
    Color,
    Group
} from 'webglRenderEngine';
import GLTFBinaryReader from './GLTFBinaryReader';
import CameraHelper from './CameraHelper';
import GLTFCubicSplineInterpolant from './GLTFCubicSplineInterpolant';

const {
    LINEAR_INTERPOLATION,
    STEP_INTERPOLATION,
    CUBIC_SPLINE_INTERPOLATION,
    OBJECT_TYPE_PERSPECTIVE_CAMERA,
    OBJECT_TYPE_ORTHOGRAPHIC_CAMERA,
} = constants;

const attributeNameMap = {
    'POSITION': 'position',
    'NORMAL': 'normal',
    'TANGENT': 'tangent',
    'TEXCOORD_0': 'uv',
    'TEXCOORD_1': 'uv2',
    'COLOR_0': 'color',
    'JOINTS_0': 'skinIndex',
    'WEIGHTS_0': 'skinWeight'
};

const componentTypeToTypedArray = {
    '5120': Int8Array,
    '5121': Uint8Array,
    '5122': Int16Array,
    '5123': Uint16Array,
    '5125': Uint32Array,
    '5126': Float32Array
};

const accessorTypeToNumComponentsMap = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16
};

const pathToTrackMap = {
    translation: VectorKeyFrameTrack,
    rotation: QuaternionKeyFrameTrack,
    scale: VectorKeyFrameTrack,
    weights: NumberKeyFrameTrack,
};

const pathToPropertyMap = {
    translation: 'position',
    rotation: 'quaternion',
    scale: 'scale',
    weights: 'morphTargetInfluences'
};

const interpolationMap = {
    LINEAR: LINEAR_INTERPOLATION,
    STEP: STEP_INTERPOLATION,
    CUBICSPLINE: CUBIC_SPLINE_INTERPOLATION
};

const DATA_TYPE = {
    GLB: 'GLB',
    GLTF: 'GLTF'
};

export default class GLTFParser {

    constructor(opts) {
        this._loader = opts.loader;
        this._cache = null;
    }

    reset(data, type) {
        this._cache = {};
        this._data = data;
        this._type = type;
    }

    _parse(type, index) {
        let cacheKey = type + ':' + index,
            parsePromise = this._cache[cacheKey];

        if (!parsePromise) {
            switch(type) {
                case 'scene':
                    parsePromise = this.parseScene(index);
                    break;
                case 'node':
                    parsePromise = this.parseNode(index);
                    break;
                case 'mesh':
                    parsePromise = this.parseMesh(index);
                    break;
                case 'material':
                    parsePromise = this.parseMaterial(index);
                    break;
                case 'accessor':
                    parsePromise = this.parseAccessor(index);
                    break;
                case 'bufferView':
                    parsePromise = this.parseBufferView(index);
                    break;
                case 'buffer':
                    parsePromise = this.parseBuffer(index);
                    break;
                case 'camera':
                    parsePromise = this.parseCamera(index);
                    break;
                case 'animation':
                    parsePromise = this.parseAnimation(index);
                    break;
                default:
                    console.warn('GLTFParser：不支持的属性类型：' + type);
            }

            this._cache[cacheKey] = parsePromise;
        }

        return parsePromise;
    }

    parse(data) {
        if (data instanceof ArrayBuffer) {
            return this.parseArrayBuffer(data);
        } else {
            return this.parseJson(data);
        }
    }

    parseArrayBuffer(data) {
        let reader = new GLTFBinaryReader(data),
            content = reader.content;

        data = JSON.parse(content);
        console.log('glTF Data:', data);

        // parse buffer时需要使用reader.body
        this._binaryReader = reader;

        // 重置所有属性（主要是缓存，以及gltf数据）
        this.reset(data, DATA_TYPE.GLB);

        return Promise.all([
            this.parseScenes(),
            this.parseAnimations(),
            this.parseCameras(),
        ]).then(function ([scenes, animations, cameras]) {
            return {
                asset: data.asset,
                scenes,
                scene: data.scene,
                cameras,
                animations
            };
        });
    }

    parseJson(data) {
        console.log('glTF Data:', data);
        // 重置所有属性（主要是缓存，以及gltf数据）
        this.reset(data, DATA_TYPE.GLTF);

        return Promise.all([
            this.parseScenes(),
            this.parseAnimations(),
            this.parseCameras(),
        ]).then(function ([scenes, animations, cameras]) {
            return {
                asset: data.asset,
                scenes,
                scene: data.scene,
                cameras,
                animations
            };
        });
    }

    parseScenes() {
        let data = this._data;
        return Promise.all(
            data.scenes.map((sceneDef, index) => this._parse('scene', index))
        );
    }

    parseAnimations() {
        let data = this._data,
            animations = data.animations || [];
        return Promise.all(
            animations.map((animation, index) => this._parse('animation', index))
        );
    }

    parseCameras() {
        let data = this._data,
            cameras = data.cameras || [];
        return Promise.all(
            cameras.map((camera, index) => this._parse('camera', index))
        );
    }

    parseAnimation(index) {
        let data = this._data,
            animDef = data.animations[index],
            channels = animDef.channels,
            samplers = animDef.samplers,
            pendingNodes = [],
            pendingInputAccessors = [],
            pendingOutputAccessors = [],
            pendingSamplers = [],
            pendingTargets = [];

        for(let i = 0, l = channels.length; i < l; i++) {
            let channel = channels[i],
                sampler = samplers[channel.sampler],
                target = channel.target,
                node = target.node,
                input = sampler.input,
                output = sampler.output;
            pendingNodes.push(this._parse('node', node));
            pendingInputAccessors.push(this._parse('accessor', input));
            pendingOutputAccessors.push(this._parse('accessor', output));
            pendingSamplers.push(sampler);
            pendingTargets.push(target);
        }

        return Promise.all([
            Promise.all(pendingNodes),
            Promise.all(pendingInputAccessors),
            Promise.all(pendingOutputAccessors),
            Promise.all(pendingSamplers),
            Promise.all(pendingTargets)
        ]).then(function ([nodes, inputAccessors, outputAccessors, samplers, targets]) {
            let tracks = [];

            for(let i = 0, l = nodes.length; i < l; i++) {
                let node = nodes[i],
                    inputAccessor = inputAccessors[i],
                    outputAccessor = outputAccessors[i],
                    sampler = samplers[i],
                    target = targets[i],
                    TrackConstructor = pathToTrackMap[target.path];

                if (outputAccessor.normalized) {
                    let outputArray = outputAccessor.array,
                        scale;
                    if (outputArray.constructor === Int8Array) {
                        scale = 1 / 127;
                    } else if (outputArray.constructor === Uint8Array) {
                        scale = 1 / 255;
                    } else if (outputArray.constructor === Int16Array) {
                        scale = 1 / 32767;
                    } else if (outputArray.constructor === Uint16Array) {
                        scale = 1 / 65535;
                    } else {
                        console.warn('GLTFParser：不支持的typearray类型');
                    }

                    let scaledArray = new Float32Array(outputArray.length);

                    for(let i = 0, l = outputArray.length; i < l; i++) {
                        scaledArray[i] = outputArray[i] * scale;
                    }

                    outputArray = scaledArray;
                }

                // let trackName = node.name + '.' + pathToPropertyMap[sampler.path],
                //     track = new TrackConstructor(trackName, inputAccessor.array, outputAccessor.array, sampler.interpolation);
                let track = new TrackConstructor(
                    node,
                    pathToPropertyMap[target.path],
                    inputAccessor.array,
                    outputAccessor.array,
                    interpolationMap[sampler.interpolation]
                );

                if (sampler.interpolation === 'CUBICSPLINE') {
                    track.interpolant = new GLTFCubicSplineInterpolant(track.times, track.values, track.getValueSize() / 3);
                }

                tracks.push(track);
            }

            let animName = animDef.name !== undefined ? animDef.name : 'animation_' + index;
            return new AnimationClip(animName, undefined, tracks);
        });
    }

    parseScene(sceneIndex) {
        let data = this._data,
            sceneDef = data.scenes[sceneIndex],
            nodeDefs = sceneDef.nodes;
        return Promise.all(
            nodeDefs.map(nodeIndex => this._parse('node', nodeIndex))
        ).then((nodes) => {
            let scene = new Scene();
            nodes.forEach((node) => {
                scene.add(node);
            });
            return scene;
        });
    }

    parseNode(nodeIndex) {
        let data = this._data,
            nodeDef = data.nodes[nodeIndex],
            parsePromises = [];

        if (nodeDef.mesh !== undefined) {
            parsePromises.push(this._parse('mesh', nodeDef.mesh));
        }

        if (nodeDef.camera !== undefined) {
            parsePromises.push(this._parse('camera', nodeDef.camera));
        }

        return Promise.all(parsePromises)
            .then((objects) => {
                let object;
                if (objects.length === 0) { // 只有children没有mesh或者camera
                    object = new Group();
                    object.name = nodeDef.name || `group_${nodeIndex}`;
                } else if (objects.length === 1) {
                    object = objects[0];
                    if (object.type === OBJECT_TYPE_PERSPECTIVE_CAMERA ||
                        object.type === OBJECT_TYPE_ORTHOGRAPHIC_CAMERA) {
                            object = new CameraHelper(object);
                    } else {
                        // mesh可以被node共用，但是node的transform（matrix、translation等等）可能不一样
                        // 所以这里需要再将mesh当作node返回之前，可能一次节点，保证transform不被覆盖
                        //
                        // parse mesh可能返回mesh或mesh的列表，所以不能直接用type===mash判断是否为mesh
                        // 这里只要不是相机就克隆节点
                        object = object.clone();
                    }
                } else if (objects.length > 1) {    // 同时包含mesh和camera（应该不存在这种情况）
                    object = new GraphObject();
                    objects.forEach((childObject) => {
                        if (childObject.type === OBJECT_TYPE_PERSPECTIVE_CAMERA ||
                            childObject.type === OBJECT_TYPE_ORTHOGRAPHIC_CAMERA) {
                            //
                        } else {
                            childObject = childObject[0].clone();
                        }
                        object.add(childObject);
                    });
                    object.name = nodeDef.name || `mesh&camera_${nodeIndex}`;
                }

                if (nodeDef.matrix) {
                    let matrix = new Mat4(nodeDef.matrix);
                    object.applyMatrix(matrix);
                } else {
                    if (nodeDef.translation) {
                        object.position.setFromArray(nodeDef.translation);
                    }

                    if (nodeDef.rotation) {
                        object.quaternion.setFromArray(nodeDef.rotation);
                    }

                    if (nodeDef.scale) {
                        object.scale.setFromArray(nodeDef.scale);
                    }
                }

                return object;
            })
            .then((object) => {
                if(nodeDef.children !== undefined) {
                    return Promise.all(
                        nodeDef.children.map(childNodeIndex => this._parse('node', childNodeIndex))
                    )
                    .then((childObjects) => {
                        childObjects.forEach((childObject) => {
                            object.add(childObject);
                        });
                        return object;
                    });
                }
                return object;
            });
    }

    // 如果primitives是空数组，返回一个GraphObject实例
    // 如果primitives仅有1个元素，返回该元素
    // 如果primitives包含1个以上的元素，返回一个GraphObject实例，所有元素都是GraphObject实例的子元素
    parseMesh(meshIndex) {
        let data = this._data,
            meshDef = data.meshes[meshIndex],
            primitives = meshDef.primitives;
        return Promise.all(
            primitives.map(primitive => this.parsePrimitive(primitive))
        ).then((objects) => {
            let object,
                name = meshDef.name ? meshDef.name : `mesh_${meshIndex}`;
            if (objects.length === 0) {
                object = new GraphObject();
            } else if (objects.length === 1) {
                object = objects[0];
            } else {
                object = new Group();
                objects.forEach((childObject, i) => {
                    childObject.name = `${name}_primitive_${i}`;
                    object.add(childObject);
                });
            }
            object.name = name;
            return object;
        });
    }

    parseCamera(cameraIndex) {

        let data = this._data,
            cameraDef = data.cameras[cameraIndex],
            camera;

        if (cameraDef.type === 'perspective') {
            let {yfov, aspectRatio, zfar, znear} = cameraDef.perspective;
            camera = new PerspectiveCamera(yfov, aspectRatio, znear, zfar);
        } else if (cameraDef.type === 'orthographic') {
            let {xmag, ymag, zfar, znear} = cameraDef.orthographic;
            camera = new OrthographicCamera(-xmag / 2, xmag / 2, ymag / 2, -ymag / 2, zfar, znear);
        } else {
            throw '不支持的camera类型';
        }

        camera.name = cameraDef.name || `${cameraDef.type}Camera.${cameraIndex}`;

        return camera;
    }

    parsePrimitive(primitive) {

        return Promise.all([
            this.loadGeometry(primitive),
            this._parse('material', primitive.material)
        ]).then(([geometry, material]) => {
            if (geometry.getAttribute('color') !== undefined) material.vertexColors = true;

            let mesh = new Mesh(geometry, material);
            mesh.drawMode = primitive.mode === undefined ? 4 : primitive.mode;

            return mesh;
        });
    }

    loadGeometry(primitive) {
        let attributes = primitive.attributes,
            geometry = new Geometry(),
            parsePromises = [];

        for(let gltfAttributeName in attributes) {
            let attributeName = attributeNameMap[gltfAttributeName],    // 将gltf定义的attribute name映射到render engine定义的name
                accessorIndex = attributes[gltfAttributeName];
            parsePromises.push(
                this._parse('accessor', accessorIndex)
                    .then(function (bufferAttribute) {
                        geometry.setAttribute(attributeName, bufferAttribute);
                    })
            );
        }

        if (primitive.indices !== undefined) {
            parsePromises.push(
                this._parse('accessor', primitive.indices)
                    .then(function (bufferAttribute) {
                        geometry.setIndex(bufferAttribute);
                    })
            );
        }

        return Promise.all(parsePromises).then(() => {
            return primitive.targets !== undefined ? this.addMorphAttributes(geometry, primitive.targets) : geometry;
        });
    }

    // 暂时仅支持position和normal
    // gltf文档中tangent的说明不完整，暂时搁置（https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-a-tangent-space-recalculation）。
    addMorphAttributes(geometry, targets) {

        let hasMorphPosition = false,
            hasMorphNormal = false;

        for(let i = 0, l = targets.length; i < l; i ++ ) {

            let target = targets[i];

            if (target.POSITION !== undefined) hasMorphPosition = true;
            if (target.NORMAL !== undefined) hasMorphNormal = true;

            if (hasMorphPosition && hasMorphNormal) break;

        }

        if (!hasMorphPosition && !hasMorphNormal) return Promise.resolve(geometry);

        let pendingPositionAccessors = [],
            pendingNormalAccessors = [];

        for(let i = 0, l = targets.length; i < l; i ++ ) {

            let target = targets[i];

            if (hasMorphPosition) {

                let pendingAccessor = target.POSITION !== undefined ?
                    this._parse('accessor', target.POSITION) :
                    geometry.attributes.position;

                pendingPositionAccessors.push(pendingAccessor);

            }

            if (hasMorphNormal) {

                let pendingAccessor = target.NORMAL !== undefined ?
                    this._parse('accessor', target.NORMAL) :
                    geometry.attributes.normal;

                pendingNormalAccessors.push(pendingAccessor);

            }

        }

        return Promise.all([
            Promise.all(pendingPositionAccessors),
            Promise.all(pendingNormalAccessors)
        ]).then(function (accessors) {

            let morphPositions = accessors[0],
                morphNormals = accessors[1];

            if (hasMorphPosition) geometry.setMorphAttribute('position', morphPositions);
            if (hasMorphNormal) geometry.setMorphAttribute('normal', morphNormals);
            geometry.morphTargetsRelative = true;

            return geometry;

        });

    }

    parseMaterial(materialIndex) {
        let data = this._data,
            material = new Material();

        if (data.materials && data.materials[materialIndex]) {
            let materialDef = data.materials[materialIndex];
            material.color = new Color(materialDef.pbrMetallicRoughness.baseColorFactor || [1, 1, 1]);
            material.metallicFactor = materialDef.pbrMetallicRoughness.metallicFactor || 1;
            material.roughnessFactor = materialDef.pbrMetallicRoughness.roughnessFactor || 1;
        } else {
            material.color = new Color([0, 0, 0, 1]);
        }

        return material;
    }

    parseAccessor(accessorIndex) {
        let data = this._data,
            accessorDef = data.accessors[accessorIndex],
            parsePromises = [];

        if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
            return Promise.resolve(null);
        }

        if (accessorDef.bufferView !== undefined) {
            parsePromises.push(this._parse('bufferView', accessorDef.bufferView));
        } else {
            parsePromises.push(null);
        }

        if (accessorDef.sparse !== undefined) {
            parsePromises.push(this._parse('bufferView', accessorDef.sparse.indices.bufferView));
            parsePromises.push(this._parse('bufferView', accessorDef.sparse.values.bufferView));
        }

        return Promise.all(parsePromises)
            .then(function (arrayBuffers) {
                let arrayBuffer = arrayBuffers[0],
                    TypedArray = componentTypeToTypedArray[accessorDef.componentType],
                    itemSize = accessorTypeToNumComponentsMap[accessorDef.type],
                    itemBytes = itemSize * TypedArray.BYTES_PER_ELEMENT,
                    byteOffset = accessorDef.byteOffset,
                    bufferView = data.bufferViews[accessorDef.bufferView],
                    byteStride = bufferView.byteStride,
                    normalized = accessorDef.normalized === true,
                    bufferAttribute,
                    array;

                if (byteStride !== undefined && byteStride !== itemBytes ) {    // The buffer is not interleaved if the stride is the item size in bytes.
                    array = new TypedArray(arrayBuffer, 0, accessorDef.count * byteStride / TypedArray.BYTES_PER_ELEMENT);
                    bufferAttribute = new BufferAttribute(array, itemSize, normalized, byteStride, byteOffset, bufferView.target);
                } else {
                    if (arrayBuffer === null) {
                        array = new TypedArray(accessorDef.count * itemSize);
                    } else {
                        array = new TypedArray(arrayBuffer, byteOffset, itemSize * accessorDef.count);
                    }
                    bufferAttribute = new BufferAttribute(array, itemSize, normalized, 0, 0, bufferView.target);
                }

                if (accessorDef.sparse !== undefined) {
                    let indicesItemSize = accessorTypeToNumComponentsMap.SCALAR,
                        IndicesTypedArray = componentTypeToTypedArray[accessorDef.sparse.indices.componentType],
                        valuesItemSize = itemSize,
                        ValuesTypedArray = TypedArray,
                        indicesOffetByte = accessorDef.sparse.indices.byteOffset,
                        valuesOffsetByte = accessorDef.sparse.values.byteOffset,
                        sparseIndices = new IndicesTypedArray(arrayBuffers[1], indicesOffetByte, accessorDef.sparse.count * indicesItemSize),
                        sparseValues = new ValuesTypedArray(arrayBuffers[2], valuesOffsetByte, accessorDef.sparse.count * valuesItemSize);

                    for(let i = 0, l = sparseIndices.length; i < l; i++) {
                        let index = sparseIndices[i];

                        bufferAttribute.array[index * valuesItemSize] = sparseValues[i * valuesItemSize];
                        if (valuesItemSize >= 2) bufferAttribute.array[index * valuesItemSize + 1] = sparseValues[i * valuesItemSize + 1];
                        if (valuesItemSize >= 3) bufferAttribute.array[index * valuesItemSize + 2] = sparseValues[i * valuesItemSize + 2];
                        if (valuesItemSize >= 4) bufferAttribute.array[index * valuesItemSize + 3] = sparseValues[i * valuesItemSize + 3];
                    }
                    
                }

                return bufferAttribute;
            });
    }

    parseBufferView(bufferViewIndex) {
        let data = this._data,
            bufferViewDef = data.bufferViews[bufferViewIndex];
        return this._parse('buffer', bufferViewDef.buffer)
            .then(function (buffer) {
                let byteLength = bufferViewDef.byteLength || 0,
                    byteOffset = bufferViewDef.byteOffset || 0,
                    start = byteOffset,
                    end = byteOffset + byteLength;
                return buffer.slice(start, end);
            });
    }

    parseBuffer(bufferIndex) {
        let data = this._data,
            bufferDef = data.buffers[bufferIndex],
            dataURLReg = /^data:(.*?)(;base64)?,(.*)/,
            execRet = dataURLReg.exec(bufferDef.uri);

        if (execRet) {
            let content = execRet[3],
                isBase64 = !!execRet[2],
                type = execRet[1];

            content = decodeURIComponent(content);
            if (isBase64) {
                content = atob(content);
            }
            
            let bufferView = new Uint8Array(content.length);
            for(let i = 0, l = content.length; i < l; i++) {
                bufferView[i] = content.charCodeAt(i);
            }

            return Promise.resolve(bufferView.buffer);
        } else {
            if (bufferDef.uri) {
                return this._loader.load(bufferDef.uri);
            } else if (this._type === DATA_TYPE.GLB) {
                return Promise.resolve(this._binaryReader.body);
            }
            
        }
    }

}
