import React from 'react';
import Menu from '../Menu';

import './index.less';

import logoImg from './logo.png';

export default class TopBar extends React.Component {

    constructor() {
        super();
        this.state = {
            menus: [{
                name: '打开',
                children: [{
                    name: '打开Gltf/Glb文件',
                    shortCut: 'Ctrl+O'
                }, {
                    name: '从远程打开Gltf/Glb文件',
                    shortCut: 'Ctrl+Shift+O'
                }]
            }, {
                name: '查看',
                children: [{
                    name: 'Perspective相机',
                    shortCut: 'P'
                }, {
                    name: 'Orthographic相机',
                    shortCut: 'O'
                }]
            }],
            showedMenu: 0
        }
    }

    handleClick() {}

    render() {

        let state = this.state;

        return (
            <div className="top-bar bg-color-black-1">
                <img src={logoImg} height="20" alt="glTF" className="logo" />
                <ul className="menu-wrappers">
                    {
                        state.menus.map((menu, i) =>
                            <li className="menu-wrapper" onClick={this.handleClick} key={menu.name}>
                                <span className="menu-name">{menu.name}</span>
                                {state.showedMenu === i && <Menu children={menu.children}></Menu>}
                            </li>
                        )
                    }
                </ul>
                <h1 className="app-title">GlTF2 Viewer</h1>
            </div>
        );

    }

}