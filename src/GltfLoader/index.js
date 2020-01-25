import React from 'react';
import FileLoader from './FileLoader';

import './index.less';
import GLTFParser from './GLTFParser';

export default class FileReader extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            active: false,
            successCallback: props.onSuccess
        };

        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragStop = this.handleDragStop.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
    }

    render() {
        return (
            <div className={`file-uploader ${this.props.hide ? 'hide' : ''}`}>
                <form
                    className={this.state.active === true ? 'box is-dragover' : 'box'}
                    method="post"
                    action=""
                    encType="multipart/form-data"
                    onDrag={this.stopEvent}
                    onDragStart={this.stopEvent}
                    onDragOver={this.handleDragStart}
                    onDragEnter={this.handleDragStart}
                    onDragLeave={this.handleDragStop}
                    onDragEnd={this.handleDragStop}
                    onDrop={this.handleDrop}
                >
                    <div className="box__input">
                        <svg className="box__icon" xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43">
                            <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
                        </svg>
                        <input className="box__file" type="file" name="files[]" id="file" data-multiple-caption="{count} files selected" multiple />
                        <label htmlFor="file"><strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span>.</label>
                        <button className="box__button" type="submit">Upload</button>
                    </div>
                </form>
            </div>
        );
    }

    stopEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleDragStart(e) {
        this.stopEvent(e);
        this.setState({ active: true });
    }
    
    // If you start off hovering directly over dropArea and then hover over one of its children,
    // then dragleave will be fired and the highlight will be removed.
    // 使用e.currentTarget可以保证处理的dom一定是form，但是渲染速度尽快依然会出去闪烁的现象
    handleDragStop(e) {
        this.stopEvent(e);
        this.setState({ active: false });
    }
    
    handleDrop(e) {
        this.handleDragStop(e);

        let callback = this.state.successCallback;
        if (callback) {
            this.loadGltf(e.dataTransfer.files).then(callback);
        }
    }

    loadGltf(files) {
        if (files && files.length > 0) {
            let gltfFile,
                fileMap = {};
            // e.dataTransfer.files是一个filelist不是数组，必须手动遍历。
            for(let i = 0, l = files.length; i < l; i++) {
                let file = files[i];
                fileMap[file.name] = file;

                if (file.name.match(/\.(gltf|glb)$/)) {
                    gltfFile = file;
                }
            }

            if (!gltfFile) {
                alert('请上传.gltf或.glb文件！');
                return;
            }

            // 每次gltf变化之后loader需要重置，清空缓存等状态。直接创建新的实例最方便。
            let fileLoader = new FileLoader(),
                gltfParser = new GLTFParser({ loader: fileLoader});

            let blobURLs = [];
            fileLoader.setURLModifier(function (url) {
                if (url in fileMap) {
                    let blobUrl = URL.createObjectURL(fileMap[url]);
                    blobURLs.push(blobUrl);
                    return blobUrl;
                }
                return url;
            });

            let p = fileLoader.load(gltfFile.name)
                .then(function (json) {
                    return gltfParser.parse(json);
                });

            blobURLs.forEach(function (url) {
                URL.revokeObjectURL(url);
            });

            return p;
        }
    }

}