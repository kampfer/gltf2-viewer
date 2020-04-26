import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Layer from '../Layer';

import './index.less';

function MenuItem(props) {

    let subMenuProps = props.subMenuProps,
        subMenuHoverDelay = props.subMenuHoverDelay;

    const [subMenuPosition, setSubMenuPosition] = useState({});

    const liRef = useRef();

    useEffect(() => {
        const bounding = liRef.current.getBoundingClientRect();
        setSubMenuPosition({ left: bounding.right, top: bounding.top });
    }, [subMenuProps && props.selected]);

    const handleClick = useCallback(function (e) {
        // 阻止冒泡，避免点击被禁用的item时隐藏menu
        e.stopPropagation();
        if (!props.disabled && props.onClick) props.onClick({key: props.uKey});
    }, [props.uKey]);

    let enterTimer = null;

    const handleMouseEnter = useCallback(function (e) {
        clearTimeout(enterTimer);

        enterTimer = setTimeout(function () {
            if (props.onMouseEnter) props.onMouseEnter({key: props.uKey});
        }, subMenuHoverDelay);
    }, [props.uKey]);

    // 使用usecallback保证不生成新的回调函数，这样可以避免重新绑定事件回调
    // 如果不这样做，因为新的回调函数和旧回调函数是不同的函数对象，所以旧回调函数会被取消绑定并销毁，导致取到错误的enterTimer
    const handleMouseLeave = useCallback(function (e) {
        clearTimeout(enterTimer);
    }, [props.uKey]);

    const className = ['menu-item'];

    if (props.disabled) className.push('disabled');
    if (subMenuProps) className.push('with-sub-menu');
    if (props.checked) className.push('checked');
    if (subMenuProps && props.selected) className.push('selected');

    return (
        <React.Fragment>
            <li ref={liRef} className={className.join(' ')} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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

    // 使用memo存储函数，只要item不变，每次会取到同一个处理函数，避免冗余的删除和绑定事件操作
    const handleMouseEnterOfItem = useMemo(() => ({key}) => setSelectedItem(key), [props.uKey]);

    // 隐藏menu时将选中的item重置为空
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
