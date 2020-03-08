import path from 'path';

function isAbsolutePath(url) {
    return /^https?:\/\//.test(url) || url.charAt(0) === '/';
}

export default class GLTFLoader {

    constructor({
        baseUrl
    } = {}) {
        this.baseUrl = baseUrl;
        this._requstingPool = {};
    }

    setURLModifier(modifier) {
        this._urlModifier = modifier;
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
        if (this._urlModifier) {
            modifiedUrl = this._urlModifier(url);
        }

        console.log(`request: ${url}(${modifiedUrl})`);
        let p = fetch(modifiedUrl).then(function (res) {
            if (res.ok) {
                return res;
            } else {
                throw('Network response was not ok.');
            }
        });

        this._requstingPool[url] = p;

        return p;
    }

}