import React from 'react';
import FileUploader from './FileUploader';
import Gltf2Viewer from './Gltf2Viewer';

import './main.less';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            files: null,
            hideFileUploader: false
        };

        this.handleReadFileSuccess = (files) => {
            this.setState({ files, hideFileUploader: true });
        };
    }

    render() {
        return (
            <div className="app">
                <FileUploader onSuccess={this.handleReadFileSuccess} hide={this.state.hideFileUploader}/>
                <Gltf2Viewer files={this.state.files}/>
            </div>
        );
    }

}