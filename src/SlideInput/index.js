import React from 'react';

import './index.less';

export default class SlideInput extends React.Component {

    render() {
        let props = this.props,
            value = props.value,
            unit = props.unit;
        return (
            <div className="slide-input">
                <span className="value">{value}</span>
                <span className="unit">{unit}</span>
            </div>
        );
    }

}