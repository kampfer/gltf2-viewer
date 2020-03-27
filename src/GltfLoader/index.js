import React from 'react';
import FileLoader from './FileLoader';
import GLTFParser from './GLTFParser';
import path from 'path';
import Spinner from '../ui/Spinner';

import './index.less';

// [火狐浏览器drop文件时会新建tab]http://mozilla.com.cn/thread-370812-1-1.html
// 解决办法：禁用拓展：“附加组件管理器”

export default class FileReader extends React.Component {

    constructor(props) {
        super(props);
        this.fileInputRef = React.createRef();
        this.state = {
            loading: false
        };
    }

    loadGltfFromFiles(files) {

        if (files && files.length > 0) {

            let gltfFile,
                fileMap = {};

            // e.dataTransfer.files是一个filelist不是数组，必须手动遍历。
            for(let i = 0, l = files.length; i < l; i++) {

                let file = files[i],
                    extname = path.extname(file.name).slice(1);

                fileMap[file.name] = file;

                if (extname === 'gltf' || extname === 'glb') {
                    gltfFile = file;
                }

            }

            if (!gltfFile) {
                let msg = '请上传.gltf或.glb文件！';
                alert(msg);
                return Promise.reject(msg);
            }

            let blobURLs = [],
                // 每次gltf变化之后loader需要重置，清空缓存等状态。直接创建新的实例最方便。
                fileLoader = new FileLoader({
                    urlModifier: function (url) {
                        if (url in fileMap) {
                            let blobUrl = URL.createObjectURL(fileMap[url]);
                            blobURLs.push(blobUrl);
                            return blobUrl;
                        }
                        return url;
                    }
                }),
                gltfParser = new GLTFParser({ loader: fileLoader });

            let p = fileLoader.load(gltfFile.name).then((data) => gltfParser.parse(data));

            blobURLs.forEach(function (url) {
                URL.revokeObjectURL(url);
            });

            return p;

        }

    }

    loadGltfFromUrl(url) {

        let extname = path.extname(url).toLowerCase();

        if (extname !== '.gltf' && extname !== '.glb') {
            return Promise.reject('文件格式不正确');
        }

        let fileLoader = new FileLoader({baseUrl: path.dirname(url)}),
            gltfParser = new GLTFParser({loader: fileLoader});

        this.setState({ loading: true });

        return fileLoader.load(path.basename(url))
            .then((data) => {
                this.setState({ loading: false })
                return gltfParser.parse(data);
            });

    }

    open() {

        let fileInput = this.fileInputRef.current;

        if (fileInput) {

            fileInput.click();

            return new Promise((resolve, reject) => {
                this.onceFileInputChange(function (input) {
                    if (input.files.length > 0) {
                        resolve(input.files);
                    } else {
                        reject('取消');
                    }
                });
                setTimeout(function () {
                    reject('操作超时！');
                }, 30 * 1000);
            })
            .then((files) => this.loadGltfFromFiles(files));

        }
        
        return Promise.reject('File Input 未完成加载！');

    }

    openUrl() {
        let url = prompt('请输入gltf或glb文件地址');
        if (!url) {
            return Promise.reject('输入已取消');
        } else {
            return this.loadGltfFromUrl(url);
        }
    }

    onceFileInputChange(callback) {
        let elem = this.fileInputRef.current;
        if (elem) {
            elem.addEventListener('change', function handleInputChnage() {
                elem.removeEventListener('change', handleInputChnage);
                callback(elem);
            }, false);
        }
    }

    componentDidMount() {
        let match = location.search.match(/gltf=([^&]*)/),
            callback = this.props.onSuccess;

        if (match && callback) {
            this.loadGltfFromUrl(match[1]).then(callback);
        }
    }

    render() {
        let displayStyle = { display: 'none' };
        return (
            <>
                { this.state.loading && <Spinner /> }
                <input type="file" name="gltfFile" style={displayStyle} ref={this.fileInputRef} multiple />
            </>
        );
    }

}