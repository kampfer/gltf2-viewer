import React from 'react';
import Menu from '../Menu';
import {
    constants
} from 'webglRenderEngine';

import './index.less';

import logoImg from './logo.png';

export default class TopBar extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            showedMenu: -1
        }

        this.handleClickAtMenuWrapper = this.handleClickAtMenuWrapper.bind(this);
        this.handleClickAtWindow = this.handleClickAtWindow.bind(this);

    }

    handleClickAtMenuWrapper(e) {
        let showedMenu = this.state.showedMenu,
            menu = Number(e.currentTarget.dataset.menu);
        e.preventDefault();
        e.stopPropagation();
        this.setState({ showedMenu: menu === showedMenu ? -1 : menu });
    }

    handleClickAtWindow() {
        this.setState({ showedMenu: -1 });
    }

    componentDidMount() {
        window.addEventListener('click', this.handleClickAtWindow, false);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClickAtWindow);
    }

    render() {

        let state = this.state,
            props = this.props,
            commandManager = props.commandManager,
            getActiveCameraType = commandManager.getCommand('renderer.getActiveCameraType'),
            activeCameraType,
            menus;
            
        if (getActiveCameraType) {
            activeCameraType = getActiveCameraType();
        }

        menus = [{
            name: '打开',
            children: [
                {
                    name: '打开Gltf/Glb文件',
                    shortCut: 'Ctrl+O',
                    command: '',
                    group: 1,
                }, {
                    name: '打开远程Gltf/Glb文件',
                    shortCut: 'Ctrl+Shift+O',
                    command: '',
                    group: 1,
                }, {
                    name: 'Perspective相机',
                    shortCut: 'P',
                    command: 'renderer.setActiveCamera',
                    checked: activeCameraType === constants.OBJECT_TYPE_PERSPECTIVE_CAMERA,
                    args: constants.OBJECT_TYPE_PERSPECTIVE_CAMERA,
                    group: 2,
                }, {
                    name: 'Orthographic相机',
                    shortCut: 'O',
                    command: 'renderer.setActiveCamera',
                    checked: activeCameraType === constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA,
                    args: constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA,
                    group: 2,
                }, {
                    name: 'Mesh视图',
                    shortCut: 'M',
                    command: '',
                    group: 3,
                }, {
                    name: 'Wireframe视图',
                    shortCut: 'W',
                    command: '',
                    group: 3,
                }
            ]
        }];

        return (
            <div className="top-bar bg-color-black-1">
                <img src={logoImg} height="20" alt="glTF" className="logo" />
                <ul className="menu-wrappers">
                    {
                        menus.map((menu, i) =>
                            <li 
                                className={'menu-wrapper' + (i === state.showedMenu ? ' selected' : '')}
                                onClick={this.handleClickAtMenuWrapper}
                                data-menu={i}
                                key={menu.name}
                            >
                                <span className="menu-name">{menu.name}</span>
                                {state.showedMenu === i && <Menu items={menu.children} commandManager={props.commandManager}></Menu>}
                            </li>
                        )
                    }
                </ul>
                <h1 className="app-title">GlTF2 Viewer</h1>
            </div>
        );

    }

}