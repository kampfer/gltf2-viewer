import React from 'react';

import './index.less';

export default class SlideInput extends React.Component {

    formatValue(v) {
        let decimal = v % 1,
            integer = Math.abs(v - decimal),
            precision = 0;

        if (decimal !== 0) {
            precision = 5 - integer.toString().length;
        }

        if (precision < 0) precision = 0;

        return v.toFixed(precision);
    }

    render() {
        let props = this.props,
            value = props.value,
            unit = props.unit;
        return (
            <div className="slide-input">
                <span className="value">{this.formatValue(value)}</span>
                <span className="unit">{unit}</span>
            </div>
        );
    }

}