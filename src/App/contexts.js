import React from 'react';

export const EnvContext = React.createContext();

function doNothing() {}

export const AppStateContext = React.createContext({
    playAnimation: doNothing,
    stopAnimation: doNothing,
    stopAllAnimations: doNothing,
});