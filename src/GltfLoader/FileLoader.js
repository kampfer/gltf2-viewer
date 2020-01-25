import path from 'path';

export default class GLTFLoader {

    constructor() {
        this._requstingPool = {};
    }

    setBaseUrl(url) {
        this._baseUrl = url;
    }

    setURLModifier(modifier) {
        this._urlModifier = modifier;
    }

    load(url) {
        if (url in this._requstingPool) {
            return this._requstingPool[url];
        }

        let modifiedUrl = url;
        if (this._urlModifier) {
            modifiedUrl = this._urlModifier(url);
        }

        console.log(`request: ${url}(${modifiedUrl})`);
        let p = fetch(modifiedUrl).then(function (res) {
            if (res.ok) {
                if (path.extname(url) === '.gltf') {
                    return res.json();
                } else {
                    return res.arrayBuffer();
                }
            } else {
                throw('Network response was not ok.');
            }
        });

        this._requstingPool[url] = p;

        return p;
    }

}