import React from 'react';

import './index.less';

export default function Menu(props) {

    return (
        <ul className="menu">
            { props.children && props.children.map((item) => 
                <li className="menu-item" key={item.name}>{item.name}<span className="short-cut">{item.shortCut}</span></li>
              )
            }
        </ul>
    );

}