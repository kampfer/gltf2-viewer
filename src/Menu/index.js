import React from 'react';

import './index.less';

function MenuItem(props) {

    let data = props.data;

    let handleClick = function () {
        let command = props.commandManager.getCommand(data.command);
        if (command) command(data.args);
    };

    return (
        <li className="menu-item" key={data.name} onClick={handleClick}>
            <span className={'command' + (data.checked ? ' checked' : '')}>
                { data.checked && <i className="icon tick"></i> }
                <span className="command-name">{data.name}</span>
                <span className="command-short-cut">{data.shortCut}</span>
            </span>
        </li>
    );

}

export default function Menu(props) {

    let menuItems = [],
        items = props.items,
        itemGroups = {},
        itemGroupsArr = [];

    if (items) {
        items.forEach((child) => {
            let group = itemGroups[child.group];
            if (!group) {
                group = itemGroups[child.group] = [];
                itemGroupsArr.push(group);
            }
            group.push(child);
        });

        itemGroupsArr.forEach((group, i) => {
            group.forEach((item) => {
                menuItems.push(<MenuItem data={item} key={item.name} commandManager={props.commandManager} />);
            });
            if (i !== itemGroupsArr.length - 1) menuItems.push(<li className="menu-separator" key={i}></li>);
        });
    }

    return (
        <ul className="menu">
            { menuItems }
        </ul>
    );

}