import React from 'react';
import { GridContainer, Grid } from '../Grid';
import Stats from '../Stats';
import ResizeHelper from '../ResizeHelper';

import GltfLoader from '../GltfLoader/static';
import GltfRenderer from '../GltfRenderer/static';
import GltfNodeViewer from '../GltfNodeViewer/static';
import GltfNodePropertyViewer from '../GltfNodePropertyViewer/static';
import TopBar from '../TopBar/static';
import StatusBar from '../StatusBar/static';

import './index.less';

export default function App() {
    return (
        <GridContainer vertical>
            <Grid>
                <TopBar></TopBar>
            </Grid>
            <Grid flexGrow={1}>
                <GridContainer>
                    <Grid width={300}>
                        <ResizeHelper resizeX>
                            <GridContainer vertical>
                                <Grid>
                                    <ResizeHelper resizeY>
                                        <GltfNodeViewer height={560}></GltfNodeViewer>
                                    </ResizeHelper>
                                </Grid>
                                <Grid flexGrow={1}>
                                    <GltfNodePropertyViewer></GltfNodePropertyViewer>
                                </Grid>
                            </GridContainer>
                        </ResizeHelper>
                    </Grid>
                    <Grid flexGrow={1}>
                        <div className="bg-color-black-1 border-radius-5" style={{position: 'relative'}}>
                            <Stats right={5} top={5} />
                            <GltfLoader hide={false} />
                            <GltfRenderer
                                hide={true}
                                width={window.innerWidth - 300 - 3}
                                height={window.innerHeight - 30 - 3 - 20 - 3}
                            />
                        </div>
                    </Grid>
                </GridContainer>
            </Grid>
            <Grid>
                <StatusBar></StatusBar>
            </Grid>
        </GridContainer>
    );
}