import React from 'react';

import './index.less';

export default function GLTFLoader(props) {
    return (
        <div className='file-uploader'>
            <svg className="file-uploader__icon" xmlns="http://www.w3.org/2000/svg" width="100" height="86" viewBox="0 0 50 43">
                <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
            </svg>
            <input className="file-uploader__file" type="file" id="file-uploader__file" multiple />
            <label htmlFor="file-uploader__file"><strong>选择文件</strong><span className="box__dragndrop">或者将文件拖动到这里</span>.</label>
            {props.children}
        </div>
    );
}