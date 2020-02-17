import Material from '@webglRenderEngine/materials/Material';
import Geometry from '@webglRenderEngine/geometries/Geometry';
import BufferAttribute from '@webglRenderEngine/renderers/BufferAttribute';
import LineSegments from '@webglRenderEngine/objects/LineSegments';
import Mesh from '@webglRenderEngine/Mesh';
import GraphObject from '@webglRenderEngine/GraphObject';

export default class CameraView extends GraphObject {

    constructor(width, height, length) {
        super();
        this.add(this.makeCameraBody(width, height, length));
        this.add(this.makeCameraUp(width * 0.8, height / 2, length, height / 2));
    }

    makeCameraBody(width, height, length) {
        let material = new Material();
        material.color = [0, 0, 0, 1];

        let halfWidth = width / 2,
            halfHeight = height / 2,
            geometry = new Geometry(),
            vertices = new Float32Array([
                0, 0, 0,
                length, halfHeight, -halfWidth,
                length, -halfHeight, halfWidth,
                length, halfHeight, halfWidth,
                length, -halfHeight, -halfWidth
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

        return new LineSegments(geometry, material);
    }

    makeCameraUp(width, height, left, bottom) {
        let material = new Material();
        material.color = [0, 0, 0, 1];

        let halfWidth = width / 2,
            offset = 0.1,
            upTriangleGeometry = new Geometry(),
            upTriangleVertices = new Float32Array([
                left, bottom + offset, -halfWidth,
                left, bottom + offset + height, 0,
                left, bottom + offset, halfWidth,
            ]),
            upTriangleIndices = new Uint8Array([0, 1, 2]);
        upTriangleGeometry.setAttribute('position', new BufferAttribute(upTriangleVertices, 3));
        upTriangleGeometry.setIndex(new BufferAttribute(upTriangleIndices, 1));

        return new Mesh(upTriangleGeometry, material);
    }

}
