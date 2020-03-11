import {
    LineSegments,
    Color,
    Geometry,
    LineBasicMaterial,
    BufferAttribute,
    Vec3,
} from 'webglRenderEngine';

export default class CameraHelper extends LineSegments {

    constructor(camera) {

        let vertices = [],
            colors = [],
            colorCone = new Color(0xff0000),
            colorUp = new Color(0x00aaff),
            pointMap = {};

        function addLine(p1, p2, color) {
            addPoint(p1, color);
            addPoint(p2, color);
        }

        function addPoint(p, color) {
            vertices.push(0, 0, 0);
            colors.push(color.r, color.b, color.b);
            if (pointMap[p] === undefined) {
                pointMap[p] = [];
            }
            pointMap[p].push(vertices.length / 3 - 1);
        }

        addLine('p', 'n1', colorCone);
        addLine('p', 'n2', colorCone);
        addLine('p', 'n3', colorCone);
        addLine('p', 'n4', colorCone);

        addLine('n1', 'n2', colorCone);
        addLine('n2', 'n3', colorCone);
        addLine('n3', 'n4', colorCone);
        addLine('n4', 'n1', colorCone);

        addLine('u1', 'u2', colorUp);
        addLine('u2', 'u3', colorUp);
        addLine('u3', 'u1', colorUp);

        let geometry = new Geometry(),
            material = new LineBasicMaterial({vertexColors: true});

        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));

        super(geometry, material);

        this.position.copy(camera.position);
        this.quaternion.copy(camera.quaternion);
        this.scale.copy(camera.scale);
        // this.matrix = camera.worldMatrix;
        // this.matrixAutoUpdate = false;

        this.camera = camera;
        this.name = camera.name;

        this.isCameraHelper = true;

        // 如果忘记清楚camera上对this的引用，那么CameraHelper的实例容易内存泄漏
        // camera.helper = this;

        this._pointMap = pointMap;

        this.update(new Vec3(1, 1, 1));

    }

    update(scale) {

        let position = this.geometry.getAttribute('position'),
            pointMap = this._pointMap;

        let setPoint = function (p, x, y, z) {
            let points = pointMap[p];
            if (points) {
                for(let i = 0, l = points.length; i < l; i++) {
                    position.setXYZ(points[i], x * scale.x, y * scale.y, z * scale.z);
                }
            }
        };

        setPoint('p', 0, 0, 0);

        setPoint('n1', 1, 1, -1);
        setPoint('n2', -1, 1, -1);
        setPoint('n3', -1, -1, -1);
        setPoint('n4', 1, -1, -1);

        setPoint('u1', 0.7 * 1, 1.1 * 1, -1);
        setPoint('u2', 0, 2 * 1, -1);
        setPoint('u3', 0.7 * -1, 1.1 * 1, -1);

    }

}