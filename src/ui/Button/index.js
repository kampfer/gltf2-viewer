import React from 'react';
import Menu from '../Menu';

import './index.less';

export default function Button(props) {

    const menuProps = props.menuProps;
    const [canShowMenu, showMenu] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState({});
    const buttonRef = React.useRef(null);

    const handleClick = function (e) {

        if (menuProps) {
            const bounding = buttonRef.current.getBoundingClientRect();
            const position = {left: bounding.left, top: bounding.top + bounding.height};
            setMenuPosition(position);
            showMenu(!canShowMenu);
        }
        
        if (props.onClick) props.onClick(e, buttonRef.current);

    };

    return (
        <button className="button" onClick={handleClick} ref={buttonRef}>
            <span className="button-label">{props.text}</span>
            { menuProps && canShowMenu && <Menu items={menuProps.items} position={menuPosition}/> }
        </button>
    );

}