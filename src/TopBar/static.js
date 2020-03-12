import React from 'react';

import './index.less';

import logoImg from './logo.png';

export default function TopBar() {

    return (
        <div className="top-bar bg-color-black-1">
            <img src={logoImg} height="20" alt="glTF" className="logo" />
            <ul className="menu">
                <li className="menu-button" onClick={() => this.props.openFile()}>打开</li>
            </ul>
            <h1 className="app-title">GlTF2 Viewer</h1>
        </div>
    );

}