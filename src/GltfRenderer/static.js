import React from 'react';

export default function GLTFRenderer(props) {
    let width = props.width,
        height = props.height;
    return (
        <canvas width={width} height={height} tabIndex="1" className="gltf-renderer"></canvas>
    );
}