/*
 * https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification
 */

import decodeText from './decodeText';

const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = {
    JSON: 0x4E4F534A,
    BIN: 0x004E4942
};
const EXTENSIONS = {
    KHR_BINARY_GLTF: 'KHR_binary_glTF'
};

export default function GLTFBinaryReader(data) {
    this.name = EXTENSIONS.KHR_BINARY_GLTF;
    this.content = null;
    this.body = null;
    let headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
    this.header = {
        magic: decodeText(new Uint8Array(data.slice(0, 4))),
        version: headerView.getUint32(4, true),
        length: headerView.getUint32(8, true)
    };

    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
        throw new Error('GLTFLoader: Unsupported glTF-Binary header.');
    } else if (this.header.version < 2.0) {
        throw new Error('GLTFLoader: Legacy binary file detected.');
    }

    let chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
    let chunkIndex = 0;

    while (chunkIndex < chunkView.byteLength) {
        let chunkLength = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;
        let chunkType = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;

        if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
            let contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
            this.content = decodeText(contentArray);
        } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
            let byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
            this.body = data.slice(byteOffset, byteOffset + chunkLength);
        } // Clients must ignore chunks with unknown types.

        chunkIndex += chunkLength;
    }

    if (this.content === null) {
        throw new Error('THREE.GLTFLoader: JSON content not found.');
    }
}