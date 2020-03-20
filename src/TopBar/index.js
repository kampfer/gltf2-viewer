import React from 'react';
import CommandBar from '../ui/CommandBar';
import { MenuItemType } from '../ui/Menu';
import { commandManager } from '../commands';
import { constants } from 'webglRenderEngine';

import './index.less';

import logoImg from './logo.png';

export default function TopBar(props) {

    const items = [
        {
            key: 'open',
            text: '功能',
            subMenuProps: {
                items: [
                    {
                        key: 'openLocalGLTF',
                        text: '打开Gltf/Glb文件',
                        secondaryText: 'Ctrl+O',
                        onClick: function () {
                            commandManager.executeCommand('open');
                        },
                        canCheck: false,
                    }, {
                        key: 'openRemoteGLTF',
                        text: '打开远程Gltf/Glb文件',
                        secondaryText: 'Ctrl+Shift+O',
                        onClick: function () {
                            commandManager.executeCommand('open');
                        },
                        canCheck: false,
                    }, {
                        key: 'separator_1',
                        itemType: MenuItemType.separator
                    }, {
                        key: 'setPerspectiveCamera',
                        text: 'Perspective相机',
                        secondaryText: 'P',
                        onClick: function() {
                            commandManager.executeCommand('renderer.setActiveCameraType', constants.OBJECT_TYPE_PERSPECTIVE_CAMERA);
                        },
                        canCheck: true,
                        isChecked: props.activeCameraType === constants.OBJECT_TYPE_PERSPECTIVE_CAMERA,
                    }, {
                        key: 'setOrthographicCamera',
                        text: 'Orthographic相机',
                        secondaryText: 'O',
                        onClick: function() {
                            commandManager.executeCommand('renderer.setActiveCameraType', constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA);
                        },
                        canCheck: true,
                        isChecked: props.activeCameraType === constants.OBJECT_TYPE_ORTHOGRAPHIC_CAMERA,
                    }, {
                        key: 'separator_2',
                        itemType: MenuItemType.separator
                    }, {
                        key: 'setMeshView',
                        text: 'Mesh视图',
                        secondaryText: 'M',
                        onClick: function () {},
                        canCheck: true,
                        isChecked: false,
                    }, {
                        key: 'setWireframeView',
                        text: 'Wireframe视图',
                        secondaryText: 'W',
                        onClick: function () {},
                        canCheck: true,
                        isChecked: false,
                    }
                ]
            }
        }
    ];

    return (
        <div className="top-bar">
            <img src={logoImg} height="20" alt="glTF" className="logo" />
            <CommandBar items={items}/>
            <h1 className="app-title">GlTF2 Viewer</h1>
        </div>
    );

}