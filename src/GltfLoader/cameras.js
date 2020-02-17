import GraphObject from '@webglRenderEngine/GraphObject';
import Material from '@webglRenderEngine/materials/Material';
import Geometry from '@webglRenderEngine/geometries/Geometry';
import BufferAttribute from '@webglRenderEngine/renderers/BufferAttribute';
import LineSegments from '@webglRenderEngine/objects/LineSegments';
import Mesh from '@webglRenderEngine/Mesh';

let material = new Material();
material.color = [0, 0, 0, 1];

let geometry = new Geometry(),
    vertices = new Float32Array([
        0, 0, 0,
        2, 0.5, -1,
        2, 0.5, 1,
        2, -0.5, 1,
        2, -0.5, -1
    ]),
    indices = new Uint8Array([
        0, 1,
        0, 2,
        0, 3,
        0, 4,
        1, 2,
        2, 3,
        3, 4,
        4, 1
    ]);
geometry.setAttribute('position', new BufferAttribute(vertices, 3));
geometry.setIndex(new BufferAttribute(indices, 1));

let cameraBody= new LineSegments(geometry, material);

let upTriangleGeometry = new Geometry(),
    upTriangleVertices = new Float32Array([
        2, 0.6, -0.8,
        2, 1, 0,
        2, 0.6, 0.8,
    ]),
    upTriangleIndices = new Uint8Array([0, 1, 2]);
upTriangleGeometry.setAttribute('position', new BufferAttribute(upTriangleVertices, 3));
upTriangleGeometry.setIndex(new BufferAttribute(upTriangleIndices, 1));

let upTriangle = new Mesh(upTriangleGeometry, material);

export class CameraViewer extends GraphObject {

    constructor() {
        super();

    }

}

export class PerspectiveCamera extends GraphObject {

    constructor(fovy, aspect, near, far) {
        super();
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

}

export class OrthographicCamera extends GraphObject {

    constructor(left, right, top, bottom, near, far) {
        super();
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.near = near;
        this.far = far;
    }

}