import Material from '@webglRenderEngine/materials/Material';
import Geometry from '@webglRenderEngine/geometries/Geometry';
import BufferAttribute from '@webglRenderEngine/renderers/BufferAttribute';
import LineSegments from '@webglRenderEngine/objects/LineSegments';
import Mesh from '@webglRenderEngine/objects/Mesh';
import GraphObject from '@webglRenderEngine/objects/GraphObject';

export default class CameraView extends GraphObject {

    constructor(width, height, length) {
        super();
        this.color = [0, 0, 0, 1];
        this.add(this.makeCameraBody(width, height, length));
        this.add(this.makeCameraUp(width, height, length));
    }

    makeCameraBody(width, height, length) {
        let material = new Material();
        material.color = this.color;

        let halfWidth = width / 2,
            halfHeight = height / 2,
            geometry = new Geometry(),
            vertices = new Float32Array([
                0, 0, 0,
                halfWidth, halfHeight, -length,
                -halfWidth, halfHeight, -length,
                -halfWidth, -halfHeight, -length,
                halfWidth, -halfHeight, -length,
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

    makeCameraUp(bodyWidth, bodyHeight, bodyLength) {
        let material = new Material();
        material.color = this.color;

        let width = bodyWidth * 0.8,
            height = bodyHeight / 4,
            halfWidth = width / 2,
            bottom = bodyHeight / 2,
            offset = height * 0.25,
            upTriangleGeometry = new Geometry(),
            upTriangleVertices = new Float32Array([
                halfWidth, bottom + offset, -bodyLength,
                0, bottom + offset + height, -bodyLength,
                -halfWidth, bottom + offset, -bodyLength,
            ]),
            upTriangleIndices = new Uint8Array([0, 1, 2]);
        upTriangleGeometry.setAttribute('position', new BufferAttribute(upTriangleVertices, 3));
        upTriangleGeometry.setIndex(new BufferAttribute(upTriangleIndices, 1));

        return new Mesh(upTriangleGeometry, material);
    }

}
