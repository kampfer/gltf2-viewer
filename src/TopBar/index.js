import React, { useContext } from 'react';
import CommandBar from '../ui/CommandBar';
import { MenuItemType } from '../ui/Menu';
import { commandManager } from '../commands';
import { constants } from 'webglRenderEngine';
import { EnvContext, AppStateContext } from '../App/contexts';

import './index.less';

import logoImg from './logo.png';

function closeWin() {
    commandManager.executeCommand('closeWin');
}

function minimizeWin() {
    commandManager.executeCommand('minimizeWin');
}

function restoreWin() {
    commandManager.executeCommand('restoreWin');
}

export default function TopBar(props) {

    const { gltf, playAnimation, stopAnimation } = useContext(AppStateContext);

    let separatorNum = 0,
        hasAnimations = gltf && gltf.animations && gltf.animations.length > 0;

    const items = [
        {
            key: 'functions',
            text: '操作',
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
                            commandManager.executeCommand('openUrl');
                        },
                        canCheck: false,
                    }, {
                        key: `separator_${separatorNum++}`,
                        itemType: MenuItemType.separator
                    }, {
                        key: 'selectAnimation',
                        text: '选择动画',
                        disabled: !hasAnimations,
                        subMenuProps: hasAnimations ? {
                            items: gltf.animations.map(clip => ({
                                canCheck: true,
                                isChecked: clip.isActivated(),
                                key: clip.uid,
                                text: clip.name,
                                onClick: () => {
                                    if (clip.isActivated()) {
                                        stopAnimation(clip);
                                    } else {
                                        playAnimation(clip);
                                    }
                                },
                            }))
                        } : null,
                    }, {
                            key: `separator_${separatorNum++}`,
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
                        key: `separator_${separatorNum++}`,
                        itemType: MenuItemType.separator
                    }, {
                        key: 'setMeshView',
                        text: 'Mesh视图',
                        secondaryText: 'M',
                        onClick: function () {
                            commandManager.executeCommand('renderer.setViewType', 'mesh');
                        },
                        canCheck: true,
                        isChecked: props.viewType === 'mesh',
                    }, {
                        key: 'setWireframeView',
                        text: 'Wireframe视图',
                        secondaryText: 'W',
                        onClick: function () {
                            commandManager.executeCommand('renderer.setViewType', 'wireframe');
                        },
                        canCheck: true,
                        isChecked: props.viewType === 'wireframe',
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
            <EnvContext.Consumer>
            {
                (ENV) => (ENV === 'electron' && 
                <div className="window-controls-container">
                    <span className="window-control icon-chrome-minimize" onClick={minimizeWin}></span>
                    <span className="window-control icon-chrome-restore" onClick={restoreWin}></span>
                    <span className="window-control icon-chrome-close" onClick={closeWin}></span>
                </div>)
            }
            </EnvContext.Consumer>
        </div>
    );

}