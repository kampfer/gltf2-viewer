import Scene from '@webglRenderEngine/Scene';
import Mesh from '@webglRenderEngine/Mesh';
import Geometry from '@webglRenderEngine/geometries/Geometry';
import Material from '@webglRenderEngine/materials/Material';
import path from 'path';
import BufferAttribute from '@webglRenderEngine/renderers/WebGLAttribute';
import GraphObject from '@webglRenderEngine/GraphObject';
import PerspectiveCamera from '@webglRenderEngine/cameras/PerspectiveCamera';
import OrthographicCamera from '@webglRenderEngine/cameras/OrthographicCamera';
import Mat4 from '@webglRenderEngine/math/Mat4';

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

export default class GLTFParser {

    constructor(opts) {
        this._loader = opts.loader;
        this._bufferCache = new WeakMap();
        this._bufferViewCache = [];
    }

    parse(data) {
        console.log('data:', data);
        let sceneDefs = data.scenes;
        return Promise.all(
                sceneDefs.map((scenedef, index) => {
                    return this.parseScene(data, index);
                })
            ).then(function (scenes) {
                return {
                    asset: data.asset,
                    scenes,
                    scene: data.scene,
                    cameras: []
                }
            })
    }

    parseScene(data, sceneIndex) {
        let sceneDef = data.scenes[sceneIndex],
            nodeDefs = sceneDef.nodes;
        return Promise.all(
            nodeDefs.map((nodeIndex) => {
                return this.parseNode(data, nodeIndex);
            })
        ).then((nodes) => {
            let scene = new Scene();
            nodes.forEach((node) => {
                scene.add(node);
            });
            return scene;
        });
    }

    parseNode(data, nodeIndex) {
        let nodeDef = data.nodes[nodeIndex],
            parsePromises = [];

        if (nodeDef.mesh !== undefined) {
            parsePromises.push(this.parseMesh(data, nodeDef.mesh));
        }

        if (nodeDef.camera !== undefined) {
            parsePromises.push(this.parseCamera(data, nodeDef.camera));
        }

        return Promise.all(parsePromises)
            .then((objects) => {
                let object;

                if (objects.length === 0) {
                    object = new GraphObject();
                } else if(objects.length === 1) {
                    object = objects[0];
                } else {
                    // object = new Group();
                    object = new GraphObject();
                    objects.forEach((childObject) => {
                        object.add(childObject);
                    });
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
                        object.scale.setFromArray(nodeDef.translation);
                    }
                }

                return object;
            })
            .then((object) => {
                if(nodeDef.children !== undefined) {
                    return Promise.all(
                        nodeDef.children.map((childNodeIndex) => {
                            return this.parseNode(data, childNodeIndex);
                        })
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
    parseMesh(data, meshIndex) {
        let meshDef = data.meshes[meshIndex],
            primitives = meshDef.primitives;
        return Promise.all(
            primitives.map((primitive) => {
                return this.parsePrimitive(data, primitive);
            })
        ).then((objects) => {
            let object;
            if (objects.length === 0) {
                object = new GraphObject();
            } else if (objects.length === 1) {
                object = objects[0];
            } else {
                // object = new Group();
                object = new GraphObject();
                objects.forEach((childObject) => {
                    object.add(childObject);
                });
            }
            return object;
        });
    }

    parseCamera(data, cameraIndex) {
        let cameraDef = data.cameras[cameraIndex];
        if (cameraDef.type === 'perspective') {
            let {yfov, aspectRatio, zfar, znear} = cameraDef.perspective;
            return new PerspectiveCamera(yfov, aspectRatio, znear, zfar);
        } else if (cameraDef.type === 'orthographic') {
            let {xmag, ymag, zfar, znear} = cameraDef.orthographic;
            return new OrthographicCamera(-xmag / 2, xmag / 2, ymag / 2, -ymag / 2, zfar, znear);
        } else {
            throw '不支持的camera类型';
        }
    }

    parsePrimitive(data, primitive) {
        let attributes = primitive.attributes,
            parsePromises = [],
            geometry = new Geometry();

        for(let gltfAttributeName in attributes) {
            let attributeName = attributeNameMap[gltfAttributeName],    // 将gltf定义的attribute name映射到render engine定义的name
                accessorIndex = attributes[gltfAttributeName];
            parsePromises.push(
                this.parseAccessor(data, accessorIndex)
                    .then(function (bufferAttribute) {
                        geometry.setAttribute(attributeName, bufferAttribute);
                    })
            );
        }

        if (primitive.indices !== undefined) {
            parsePromises.push(
                this.parseAccessor(data, primitive.indices)
                    .then(function (bufferAttribute) {
                        geometry.setIndex(bufferAttribute);
                    })
            );
        }

        return Promise.all(parsePromises)
            .then(() => {
                return this.parseMaterial(data, primitive.material);
            })
            .then(function (material) {
                let mesh = new Mesh(geometry, material);
                mesh.drawMode = primitive.mode === undefined ? 4 : primitive.mode;
                return mesh;
            });
    }

    parseMaterial(data, MaterialIndex) {
        let material = new Material();

        if (data.materials && data.materials[MaterialIndex]) {
            let materialDef = data.materials[MaterialIndex];
            material.color = materialDef.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1];
            material.metallicFactor = materialDef.pbrMetallicRoughness.metallicFactor || 1;
            material.roughnessFactor = materialDef.pbrMetallicRoughness.roughnessFactor || 1;
        } else {
            material.color = [0, 0, 0, 1];
        }

        return material;
    }

    parseAccessor(data, accessorIndex) {
        let accessorDef = data.accessors[accessorIndex],
            parsePromises = [];

        if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
            return Promise.resolve(null);
        }

        if (accessorDef.bufferView !== undefined) {
            parsePromises.push(this.parseBufferView(data, accessorDef.bufferView));
        } else {
            parsePromises.push(null);
        }

        if (accessorDef.sparse !== undefined) {
            parsePromises.push(this.parseBufferView(data, accessorDef.sparse.indices.bufferView));
            parsePromises.push(this.parseBufferView(data, accessorDef.sparse.values.bufferView));
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
                    bufferAttribute = new BufferAttribute(array, bufferView.target, itemSize, normalized, byteStride, byteOffset);
                } else {
                    if (arrayBuffer === null) {
                        array = new TypedArray(accessorDef.count * itemSize);
                    } else {
                        array = new TypedArray(arrayBuffer, byteOffset, itemSize * accessorDef.count);
                    }
                    bufferAttribute = new BufferAttribute(array, bufferView.target, itemSize, normalized, 0, 0);
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

    parseBufferView(data, bufferViewIndex) {
        let parsePromise = this._bufferViewCache[bufferViewIndex];
        if (!parsePromise) {
            let bufferViewDef = data.bufferViews[bufferViewIndex];
            this._bufferViewCache[bufferViewIndex] = parsePromise = 
                this.parseBuffer(data, bufferViewDef.buffer)
                    .then(function (buffer) {
                        let byteLength = bufferViewDef.byteLength || 0,
                            byteOffset = bufferViewDef.byteOffset || 0,
                            start = byteOffset,
                            end = byteOffset + byteLength;
                        return buffer.slice(start, end);
                    });
        }
        return parsePromise;
    }

    parseBuffer(data, bufferIndex) {
        let bufferDef = data.buffers[bufferIndex],
            dataURLReg = /^data:(.*?)(;base64)?,(.*)/,
            execRet = dataURLReg.exec(bufferDef.uri);

        let buffer = this._bufferCache.get(bufferDef);
        if (buffer) {
            return Promise.resolve(buffer);
        }

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

            this._bufferCache.set(bufferDef, bufferView.buffer);

            return Promise.resolve(bufferView.buffer);
        } else {
            return this._loader.request(bufferDef.uri)
                .then((res) => {
                    let buffer = this._bufferCache.get(bufferDef);
                    if (!buffer) {
                         this._bufferCache.set(bufferDef, res);
                    }
                    return res;
                });
        }
    }

}
