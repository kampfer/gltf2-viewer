import path from 'path';

// path.isAbsolutePath有bug，自己显示一个
function isAbsolutePath(url) {
    return /^https?:\/\//.test(url) || url.charAt(0) === '/';
}

// const MIME_TYPES = {
//     json: 'application/json',
//     gltf: 'model/gltf+json',
//     glb: 'model/gltf-binary',
//     bin: 'application/octet-stream',
// };

const jsonFormater = function(res) {
    return res.json();
};

const arrayBufferFormater = function(res) {
    return res.arrayBuffer();
}

const responseFormaters = {
    gltf: jsonFormater,
    glb: arrayBufferFormater,
    bin: arrayBufferFormater
};

export default class FileLoader {

    constructor({
        baseUrl,
        urlModifier
    } = {}) {
        this.baseUrl = baseUrl;
        this.urlModifier = urlModifier;
        this._requstingPool = {};
    }

    extname(url) {
        return path.extname(url).slice(1);
    }

    formatResponse(res, url) {
        let extname = this.extname(url);
        return responseFormaters[extname](res);
    }

    // 本地文件的路径格式： filename.gltf
    // 网络文件的路径格式： http(s)://path/to/gltf || path/to/gltf
    load(url) {
        if (url in this._requstingPool) {
            return this._requstingPool[url];
        }

        if (!isAbsolutePath(url) && this.baseUrl) {
            url = `${this.baseUrl}/${url}`;
        }

        let modifiedUrl = url;
        if (this.urlModifier) {
            modifiedUrl = this.urlModifier.call(this, url);
        }

        console.log(`request: ${url}(${modifiedUrl})`);
        let p = fetch(modifiedUrl)
            .then((res) => {
                if (res.ok) {
                    return this.formatResponse(res, url);
                } else {
                    throw('Network response was not ok.');
                }
            });

        this._requstingPool[url] = p;

        return p;
    }

}