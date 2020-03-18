import React, { useEffect } from 'react';
import { KeyCode, keyCodeToStr } from './keyCodes';
import keyBindings from './keyBindings';

export default function KeyBinder (props) {

    let handleKeyDown = function(e) {

        e.preventDefault();

        let { keyCode, ctrlKey, shiftKey, altKey, metaKey, } = e,
            key = [];

        if (ctrlKey) key.push(keyCodeToStr(KeyCode.Ctrl));
        if (shiftKey) key.push(keyCodeToStr(KeyCode.Shift));
        if (altKey) key.push(keyCodeToStr(KeyCode.Alt));
        if (metaKey) key.push(keyCodeToStr(KeyCode.Meta));
        key.push(keyCodeToStr(keyCode));

        key = key.join('+');

        for(let i = keyBindings.length - 1; i >= 0; i--) {

            let keybinding = keyBindings[i];

            if (keybinding.key === key) {

                let command = props.commandManager.getCommand(keybinding.command),
                    args = keybinding.args;

                if (command) command(args);

            }

        }

    };

    useEffect(() => {
        let target = props.target || window;
        // keydown事件里的keycode不区分大小写字母
        target.addEventListener('keydown', handleKeyDown);
        return () => target.removeEventListener('keydown', handleKeyDown);
    })

    return (
        <>{props.children}</>
    );

}