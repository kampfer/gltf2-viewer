import React from 'react';
import ReactDOM from 'react-dom';
import Layer from '../Layer';

import './index.less';

function MenuItem(props) {

    let handleClick = function (e) {
        if (props.onClick) props.onClick(e, {key: props.uKey});
    };

    return (
        <li className="menu-item" onClick={handleClick}>
            <span className={'command' + (props.checked ? ' checked' : '')}>
                { props.checked && <i className="icon-tick"></i> }
                <span className="command-name">{props.text}</span>
                <span className="command-short-cut">{props.secondaryText}</span>
            </span>
        </li>
    );

}

export default function Menu(props) {

    const displayStyle = {
        ...props.position
    };

    const [isHided, hide] = React.useState(true);

    const handleClickAtLayer = function (e) {
        e.preventDefault();
        hide(!isHided)
    };

    return ReactDOM.createPortal(
        <Layer onClick={handleClickAtLayer}>
            <ul className="menu" style={displayStyle}>
                {
                    props.items.map((item) => {
                        if (item.itemType === MenuItemType.separator) {
                            return (<li className="menu-separator" key={item.key}></li>);
                        } else {
                            let checked = item.canCheck && item.isChecked;
                            return (<MenuItem
                                checked={checked}
                                key={item.key}
                                uKey={item.key}
                                onClick={item.onClick}
                                text={item.text}
                                secondaryText={item.secondaryText}
                            />);
                        }
                    })
                }
            </ul>
        </Layer>,
        document.body
    );

}

export const MenuItemType = {
    separator: 0,
};