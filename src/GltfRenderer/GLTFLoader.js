import GLTFParser from './GLTFParser';
import path from 'path';

export default class GLTFLoader {

    constructor() {
        this._parser = new GLTFParser({
            loader: this
        });
        this._requstingPool = {};
    }

    setBaseUrl(url) {
        this._baseUrl = url;
    }

    setURLModifier(modifier) {
        this._urlModifier = modifier;
    }

    request(url) {
        if (url in this._requstingPool) {
            return this._requstingPool[url];
        }

        let modifiedUrl = url;
        if (this._urlModifier) {
            modifiedUrl = this._urlModifier(url);
        }

        console.log('make request');
        let p = fetch(modifiedUrl).then(function (res) {
            console.log(res);
            if (res.ok) {
                console.log(typeof res);
                // return res.json();
                console.log(path.extname(url));
                if (path.extname(url) === '.gltf') {
                    return res.json();
                } else {
                    return res.arrayBuffer();
                }
            } else {
                throw('Network response was not ok.');
            }
        });

        return p;
    }

    load(url) {
        return this.request(url).then((json) => {
            return this._parser.parse(json);
        });
    }

}