import { Interpolant } from 'webglRenderEngine';

export default class GLTFCubicSplineInterpolant extends Interpolant {

    _interpolate(i1, t0, t, t1) {

        let yArray = this.yArray,
            stride = this.ySize,    // 节点个数
            stride2 = stride * 2,
            stride3 = stride * 3,
            result = new yArray.constructor(stride),
            p = (t - t0) / (t1 - t0),
            pp = p * p,
            ppp = pp * p,
            s2 = - 2 * ppp + 3 * pp,
            s3 = ppp - pp,
            s0 = 1 - s2,
            s1 = s3 - pp + p,
            td = t1 - t0,
            offset1 = i1 * stride3,
            offset0 = offset1 - stride3;

        for(let i = 0; i < stride; i++) {
            // gltf数据格式：https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
            // ...,ak,vk,bk,...
            let p0 = yArray[offset0 + i + stride],  // v_k
                p1 = yArray[offset1 + i + stride],  // v_{k+1}
                m0 = yArray[offset0 + i + stride2] * td,    // b_k
                m1 = yArray[offset1 + i] * td;  // a_{k+1}

            result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
        }

        return result;

    } 

}