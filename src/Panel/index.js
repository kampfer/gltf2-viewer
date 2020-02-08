import React from 'react';
import { GridContainer, Grid } from '../Grid';

import './index.less';

export default class Panel extends React.Component {

    render() {
        let props = this.props,
            className = `panel ${props.className}`;

        return (
            <div className={className}>
                <GridContainer vertical>
                    <Grid>
                        <div className="head">
                            <div className="name">{props.title}</div>
                            <div className="tools"></div>
                        </div>
                    </Grid>
                    <Grid flexGrow={1}>
                        <div className="body">{props.children}</div>
                    </Grid>
                </GridContainer>
            </div>
        )
    }

}