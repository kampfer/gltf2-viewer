import React from 'react';
import Button from '../Button';

import './index.less';

export default function CommandBar(props) {

    return (
        <ul className="command-bar">
            {
                props.items.map((item) => <Button key={item.key} text={item.text} menuProps={item.subMenuProps} />)
            }
        </ul>
    );

}