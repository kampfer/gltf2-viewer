import React from 'react';
import Menu from '../Menu';

import './index.less';

export default function Button(props) {

    const menuProps = props.menuProps;

    const calculateMenuPosition = React.useCallback((elem) => {
        const bounding = elem.getBoundingClientRect();
        return {left: bounding.left, top: bounding.top + bounding.height};
    }, []);

    const [selected, setSelected] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState({});

    // const buttonRef = React.useRef(null);

    const handleClick = function (e) {

        if (menuProps) {
            const position = calculateMenuPosition(e.currentTarget);
            setMenuPosition(position);
        }

        setSelected(!selected);

        if (props.onClick) props.onClick(e, buttonRef.current);

    };

    return (
        <button className={`button ${selected ? 'selected' : ''}`} onClick={handleClick}>
            <span className="button-label">{props.text}</span>
            { menuProps && <Menu items={menuProps.items} position={menuPosition} hidden={!selected}/> }
        </button>
    );

}