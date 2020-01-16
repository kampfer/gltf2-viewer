import GLTFParser from './GLTFParser';
import path from 'path';

export default class GLTFLoader {

    constructor() {
        this._parser = new GLTFParser();
    }

    load(url) {
        return fetch(url).then(function (res) {
            if (res.ok) {
                return res.json();
            } else {
                throw('Network response was not ok.');
            }
        }).then((json) => {
            let baseUrl = path.dirname(url);
            this._parser.setBaseUrl(baseUrl);
            return this._parser.parse(json);
        });
    }

}