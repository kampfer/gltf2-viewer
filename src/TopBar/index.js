import React from 'react';
import CommandBar from '../ui/CommandBar';
import { MenuItemType } from '../ui/Menu';

import './index.less';

import logoImg from './logo.png';

export default function TopBar() {

    const [selection, setSelection] = React.useState({});

    const onToggleSelect = React.useCallback(
        (e, item) => {
            e.preventDefault();
            if (item) {
                setSelection({ ...selection, [item.key]: selection[item.key] === undefined ? true : !selection[item.key] });
            }
        },
        [selection]
    );

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
                        onClick: onToggleSelect,
                        canCheck: false,
                        isChecked: selection.openLocalGLTF,
                    }, {
                        key: 'openRemoteGLTF',
                        text: '打开远程Gltf/Glb文件',
                        secondaryText: 'Ctrl+Shift+O',
                        onClick: onToggleSelect,
                        canCheck: false,
                        isChecked: selection.openRemoteGLTF,
                    }, {
                        key: 'separator_1',
                        itemType: MenuItemType.separator
                    }, {
                        key: 'setPerspectiveCamera',
                        text: 'Perspective相机',
                        secondaryText: 'P',
                        onClick: onToggleSelect,
                        canCheck: true,
                        isChecked: selection.setPerspectiveCamera,
                    }, {
                        key: 'setOrthographicCamera',
                        text: 'Orthographic相机',
                        secondaryText: 'O',
                        onClick: onToggleSelect,
                        canCheck: true,
                        isChecked: selection.setOrthographicCamera,
                    }, {
                        key: 'separator_2',
                        itemType: MenuItemType.separator
                    }, {
                        key: 'setMeshView',
                        text: 'Mesh视图',
                        secondaryText: 'M',
                        onClick: onToggleSelect,
                        canCheck: true,
                        isChecked: selection.setMeshView,
                    }, {
                        key: 'setWireframeView',
                        text: 'Wireframe视图',
                        secondaryText: 'W',
                        onClick: onToggleSelect,
                        canCheck: true,
                        isChecked: selection.setWireframeView,
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