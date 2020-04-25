import React from 'react';
import ReactDOM from 'react-dom';
import Layer from '../Layer';

import './index.less';

function MenuItem(props) {

    let subMenuProps = props.subMenuProps;

    const [showSubMenu, setShowSubMenu] = React.useState(false);
    const [subMenuPosition, setSubMenuPosition] = React.useState();
    const itemRef = React.createRef();

    const calculateSubMenuPosition = React.useCallback(() => {

        const bounding = itemRef.current.getBoundingClientRect();
        const position = { left: bounding.right, top: bounding.top };

        return position;

    }, [subMenuProps]);

    const handleClick = function (e) {

        if (subMenuProps) {

            let subMenuPosition = calculateSubMenuPosition();

            setShowSubMenu(!showSubMenu);
            setSubMenuPosition(subMenuPosition);

        }

        if (props.disabled || subMenuProps) e.stopPropagation();
        if (!props.disabled && props.onClick) props.onClick(e, {key: props.uKey});
    };

    const className = ['menu-item'];

    if (props.disabled) className.push('disabled');
    if (subMenuProps) className.push('with-sub-menu');
    if (props.checked) className.push('checked');

    return (
        <React.Fragment>
            <li ref={itemRef} className={className.join(' ')} onClick={handleClick}>
                <span className='command'>
                    { props.checked && <i className="icon-tick"></i> }
                    <span className="command-name">{props.text}</span>
                    <span className="command-short-cut">{props.secondaryText}</span>
                    { subMenuProps && <i className="icon-arrow-right"></i> }
                </span>
            </li>
            { subMenuProps && showSubMenu && <Menu items={subMenuProps.items} position={subMenuPosition} /> }
        </React.Fragment>
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
                                disabled={item.disabled}
                                subMenuProps={item.subMenuProps}
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
