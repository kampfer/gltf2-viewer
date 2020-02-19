import React from 'react';

import './index.less';

export default class Panel extends React.Component {

    render() {
        let props = this.props,
            className = `panel ${props.className}`;

        return (
            <div className={className}>
                <div className="head">
                    <div className="name">{props.title}</div>
                    <div className="tools"></div>
                </div>
                <div className="body">{props.children}</div>
            </div>
        )
    }

}