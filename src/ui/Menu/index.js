import React, { useState, useEffect } from 'react';
import Layer from '../Layer';

import './index.less';

function MenuItem(props) {

    let subMenuProps = props.subMenuProps,
        subMenuHoverDelay = props.subMenuHoverDelay;

    const [subMenuPosition, setSubMenuPosition] = useState({});
    const [enterTimer, setEnterTimer] = useState(null);

    const calculateSubMenuPosition = React.useCallback((elem) => {
        const bounding = elem.getBoundingClientRect();
        return { left: bounding.right, top: bounding.top };
    }, [subMenuProps]);

    const handleClick = function (e) {
        // 阻止冒泡，避免点击被禁用的item时隐藏menu
        if (props.disabled) e.stopPropagation();
        if (!props.disabled && props.onClick) props.onClick({key: props.uKey});
    };

    const handleMouseEnter = function (e) {
        clearTimeout(enterTimer);

        if (props.disabled) return;

        let position = calculateSubMenuPosition(e.currentTarget);
        setSubMenuPosition(position);

        setEnterTimer(setTimeout(function () {
            if (props.onMouseEnter) props.onMouseEnter({key: props.uKey});
        }, subMenuHoverDelay));
    }

    const handleMouseLeave = function (e) {
        clearTimeout(enterTimer);
    }

    const className = ['menu-item'];

    if (props.disabled) className.push('disabled');
    if (subMenuProps) className.push('with-sub-menu');
    if (props.checked) className.push('checked');
    if (subMenuProps && props.selected) className.push('selected');

    return (
        <React.Fragment>
            <li className={className.join(' ')} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <span className='command'>
                    { props.checked && <i className="icon-tick"></i> }
                    <span className="command-name">{props.text}</span>
                    <span className="command-short-cut">{props.secondaryText}</span>
                    { subMenuProps && <i className="icon-arrow-right"></i> }
                </span>
            </li>
            { subMenuProps && <Menu items={subMenuProps.items} position={subMenuPosition} hidden={!props.selected} /> }
        </React.Fragment>
    );

}

export default function Menu(props) {

    const displayStyle = {
        display: props.hidden ? 'none' : 'unset',
        ...props.position
    };

    const [selectedItem, setSelectedItem] = useState(null);

    const handleMouseEnterOfItem = function ({key}) {
        setSelectedItem(key);
    };

    useEffect(() => {
        if (props.hidden) setSelectedItem(null);
    }, [props.hidden]);

    return (
        <Layer>
            <ul className="menu" style={displayStyle}>
                {
                    props.items.map((item) => {
                        if (item.itemType === MenuItemType.separator) {
                            return (<li className="menu-separator" key={item.key}></li>);
                        } else {
                            let checked = item.canCheck && item.isChecked;
                            return (<MenuItem
                                checked={checked}
                                selected={!props.hidden && selectedItem === item.key}
                                key={item.key}
                                uKey={item.key}
                                onClick={item.onClick}
                                onMouseEnter={handleMouseEnterOfItem}
                                text={item.text}
                                secondaryText={item.secondaryText}
                                disabled={item.disabled}
                                subMenuProps={item.subMenuProps}
                                subMenuHoverDelay={item.subMenuHoverDelay || 250}
                            />);
                        }
                    })
                }
            </ul>
        </Layer>
    );

}

export const MenuItemType = {
    separator: 0,
};
