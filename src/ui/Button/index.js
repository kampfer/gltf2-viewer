import React, { useEffect, useRef } from 'react';
import Menu from '../Menu';

import './index.less';

export default function Button(props) {

    const menuProps = props.menuProps;

    const [active, activate] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState({});

    const buttonRef = useRef();

    // 点击button显示menu
    const handleClick = function () {
        activate(true);
    };

    // 计算menu位置
    useEffect(() => {
        console.log('getBoundingClientRect in button');
        const bounding = buttonRef.current.getBoundingClientRect();
        setMenuPosition({left: bounding.left, top: bounding.top + bounding.height});
    }, [menuProps.text]);

    // 点击body隐藏menu
    useEffect(() => {
        function blur() {
            activate(false);
        }

        document.body.addEventListener('click', blur, false);

        return () => document.body.removeEventListener('click', blur);
    }, [menuProps.text]);

    return (
        <button className={`button ${active ? 'selected' : ''}`} onClick={handleClick} ref={buttonRef}>
            <span className="button-label">{props.text}</span>
            { menuProps && <Menu items={menuProps.items} position={menuPosition} hidden={!active}/> }
        </button>
    );

}