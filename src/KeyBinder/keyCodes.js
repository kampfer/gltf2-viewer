// http://www.javascriptkeycode.com/
// https://github.com/microsoft/vscode/blob/7e4c8c983d181cbb56c969662ead5f9a59bfd786/src/vs/base/browser/keyboardEvent.ts
export const KeyCode = {
    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Ctrl: 17,
    Alt: 18,
    PauseBreak: 19,
    CapsLock: 20,
    Esc: 27,
    Space: 32,
    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,
    LeftArrow: 37,
    UpArrow: 38,
    RightArrow: 39,
    DownArrow: 40,
    Insert: 45,
    Delete: 46,
    KEY_0: 48,
    KEY_1: 49,
    KEY_2: 50,
    KEY_3: 51,
    KEY_4: 52,
    KEY_5: 53,
    KEY_6: 54,
    KEY_7: 55,
    KEY_8: 56,
    KEY_9: 57,
    KEY_A: 65,
    KEY_B: 66,
    KEY_C: 67,
    KEY_D: 68,
    KEY_E: 69,
    KEY_F: 70,
    KEY_G: 71,
    KEY_H: 72,
    KEY_I: 73,
    KEY_J: 74,
    KEY_K: 75,
    KEY_L: 76,
    KEY_M: 77,
    KEY_N: 78,
    KEY_O: 79,
    KEY_P: 80,
    KEY_Q: 81,
    KEY_R: 82,
    KEY_S: 83,
    KEY_T: 84,
    KEY_U: 85,
    KEY_V: 86,
    KEY_W: 87,
    KEY_X: 88,
    KEY_Y: 89,
    KEY_Z: 90,
    LeftWinKey: 91,
    RightWinKey: 92,
    ContextMenu: 93,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    NUMPAD_MULTIPLY: 106,
    NUMPAD_ADD: 107,
    NUMPAD_SEPARATOR: 108,
    NUMPAD_SUBTRACT: 109,
    NUMPAD_DECIMAL: 110,
    NUMPAD_DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NumLock: 144,
    ScrollLock: 145,
    US_SEMICOLON: 186,
    US_EQUAL: 187,
    US_COMMA: 188,
    US_MINUS: 189,
    US_DOT: 190,
    US_SLASH: 191,
    US_BACKTICK: 192,
    ABNT_C1: 193,
	ABNT_C2: 194,
    US_OPEN_SQUARE_BRACKET: 219,
    US_BACKSLASH: 220,
    US_CLOSE_SQUARE_BRACKET: 221,
    US_QUOTE: 222,
    OEM_8: 223,
    OEM_102: 226,
    KEY_IN_COMPOSITION: 229,
};

const isMacintosh = navigator.userAgent.indexOf('Macintosh') > -1;
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
const isWebKit = navigator.userAgent.toLowerCase().indexOf('AppleWebKit') > -1;

if (isFirefox) {
    KeyCode.US_SEMICOLON = 59;
    KeyCode.US_EQUAL = 107;
    KeyCode.US_MINUS = 109;
    if (isMacintosh) {
        KeyCode.Meta = 224;
    }
} else if (isWebKit) {
    KeyCode.Meta = 91;
    if (isMacintosh) {
        // the two meta keys in the Mac have different key codes (91 and 93)
        KeyCode.Meta = 93;
    } else {
        KeyCode.Meta = 92;
    }
}

class KeyCodeStrMap {

    constructor() {
        this._keyCodeToStr = [];
        this._strToKeyCode = {};
    }

    define(keyCode, str) {
        this._keyCodeToStr[keyCode] = str;
        this._strToKeyCode[str.toLowerCase()] = keyCode;
    }

    keyCodeToStr(keyCode) {
        return this._keyCodeToStr[keyCode];
    }

    strToKeyCode(str) {
        return this._strToKeyCode[str.toLowerCase()] || KeyCode.Unknown;
    }

}

const uiMap = new KeyCodeStrMap();

uiMap.define(KeyCode.Unknown, 'unknown');

uiMap.define(KeyCode.Backspace, 'Backspace');
uiMap.define(KeyCode.Tab, 'Tab');
uiMap.define(KeyCode.Enter, 'Enter');
uiMap.define(KeyCode.Shift, 'Shift');
uiMap.define(KeyCode.Ctrl, 'Ctrl');
uiMap.define(KeyCode.Alt, 'Alt');
uiMap.define(KeyCode.PauseBreak, 'PauseBreak');
uiMap.define(KeyCode.CapsLock, 'CapsLock');
uiMap.define(KeyCode.Escape, 'Escape');
uiMap.define(KeyCode.Space, 'Space');
uiMap.define(KeyCode.PageUp, 'PageUp');
uiMap.define(KeyCode.PageDown, 'PageDown');
uiMap.define(KeyCode.End, 'End');
uiMap.define(KeyCode.Home, 'Home');

uiMap.define(KeyCode.LeftArrow, 'LeftArrow', 'Left');
uiMap.define(KeyCode.UpArrow, 'UpArrow', 'Up');
uiMap.define(KeyCode.RightArrow, 'RightArrow', 'Right');
uiMap.define(KeyCode.DownArrow, 'DownArrow', 'Down');
uiMap.define(KeyCode.Insert, 'Insert');
uiMap.define(KeyCode.Delete, 'Delete');

uiMap.define(KeyCode.KEY_0, '0');
uiMap.define(KeyCode.KEY_1, '1');
uiMap.define(KeyCode.KEY_2, '2');
uiMap.define(KeyCode.KEY_3, '3');
uiMap.define(KeyCode.KEY_4, '4');
uiMap.define(KeyCode.KEY_5, '5');
uiMap.define(KeyCode.KEY_6, '6');
uiMap.define(KeyCode.KEY_7, '7');
uiMap.define(KeyCode.KEY_8, '8');
uiMap.define(KeyCode.KEY_9, '9');

uiMap.define(KeyCode.KEY_A, 'A');
uiMap.define(KeyCode.KEY_B, 'B');
uiMap.define(KeyCode.KEY_C, 'C');
uiMap.define(KeyCode.KEY_D, 'D');
uiMap.define(KeyCode.KEY_E, 'E');
uiMap.define(KeyCode.KEY_F, 'F');
uiMap.define(KeyCode.KEY_G, 'G');
uiMap.define(KeyCode.KEY_H, 'H');
uiMap.define(KeyCode.KEY_I, 'I');
uiMap.define(KeyCode.KEY_J, 'J');
uiMap.define(KeyCode.KEY_K, 'K');
uiMap.define(KeyCode.KEY_L, 'L');
uiMap.define(KeyCode.KEY_M, 'M');
uiMap.define(KeyCode.KEY_N, 'N');
uiMap.define(KeyCode.KEY_O, 'O');
uiMap.define(KeyCode.KEY_P, 'P');
uiMap.define(KeyCode.KEY_Q, 'Q');
uiMap.define(KeyCode.KEY_R, 'R');
uiMap.define(KeyCode.KEY_S, 'S');
uiMap.define(KeyCode.KEY_T, 'T');
uiMap.define(KeyCode.KEY_U, 'U');
uiMap.define(KeyCode.KEY_V, 'V');
uiMap.define(KeyCode.KEY_W, 'W');
uiMap.define(KeyCode.KEY_X, 'X');
uiMap.define(KeyCode.KEY_Y, 'Y');
uiMap.define(KeyCode.KEY_Z, 'Z');

uiMap.define(KeyCode.Meta, 'Meta');
uiMap.define(KeyCode.ContextMenu, 'ContextMenu');

uiMap.define(KeyCode.F1, 'F1');
uiMap.define(KeyCode.F2, 'F2');
uiMap.define(KeyCode.F3, 'F3');
uiMap.define(KeyCode.F4, 'F4');
uiMap.define(KeyCode.F5, 'F5');
uiMap.define(KeyCode.F6, 'F6');
uiMap.define(KeyCode.F7, 'F7');
uiMap.define(KeyCode.F8, 'F8');
uiMap.define(KeyCode.F9, 'F9');
uiMap.define(KeyCode.F10, 'F10');
uiMap.define(KeyCode.F11, 'F11');
uiMap.define(KeyCode.F12, 'F12');
uiMap.define(KeyCode.F13, 'F13');
uiMap.define(KeyCode.F14, 'F14');
uiMap.define(KeyCode.F15, 'F15');
uiMap.define(KeyCode.F16, 'F16');
uiMap.define(KeyCode.F17, 'F17');
uiMap.define(KeyCode.F18, 'F18');
uiMap.define(KeyCode.F19, 'F19');

uiMap.define(KeyCode.NumLock, 'NumLock');
uiMap.define(KeyCode.ScrollLock, 'ScrollLock');

uiMap.define(KeyCode.US_SEMICOLON, ';', ';', 'OEM_1');
uiMap.define(KeyCode.US_EQUAL, '=', '=', 'OEM_PLUS');
uiMap.define(KeyCode.US_COMMA, ',', ',', 'OEM_COMMA');
uiMap.define(KeyCode.US_MINUS, '-', '-', 'OEM_MINUS');
uiMap.define(KeyCode.US_DOT, '.', '.', 'OEM_PERIOD');
uiMap.define(KeyCode.US_SLASH, '/', '/', 'OEM_2');
uiMap.define(KeyCode.US_BACKTICK, '`', '`', 'OEM_3');
uiMap.define(KeyCode.ABNT_C1, 'ABNT_C1');
uiMap.define(KeyCode.ABNT_C2, 'ABNT_C2');
uiMap.define(KeyCode.US_OPEN_SQUARE_BRACKET, '[', '[', 'OEM_4');
uiMap.define(KeyCode.US_BACKSLASH, '\\', '\\', 'OEM_5');
uiMap.define(KeyCode.US_CLOSE_SQUARE_BRACKET, ']', ']', 'OEM_6');
uiMap.define(KeyCode.US_QUOTE, '\'', '\'', 'OEM_7');
uiMap.define(KeyCode.OEM_8, 'OEM_8');
uiMap.define(KeyCode.OEM_102, 'OEM_102');

uiMap.define(KeyCode.NUMPAD_0, 'NumPad0');
uiMap.define(KeyCode.NUMPAD_1, 'NumPad1');
uiMap.define(KeyCode.NUMPAD_2, 'NumPad2');
uiMap.define(KeyCode.NUMPAD_3, 'NumPad3');
uiMap.define(KeyCode.NUMPAD_4, 'NumPad4');
uiMap.define(KeyCode.NUMPAD_5, 'NumPad5');
uiMap.define(KeyCode.NUMPAD_6, 'NumPad6');
uiMap.define(KeyCode.NUMPAD_7, 'NumPad7');
uiMap.define(KeyCode.NUMPAD_8, 'NumPad8');
uiMap.define(KeyCode.NUMPAD_9, 'NumPad9');

uiMap.define(KeyCode.NUMPAD_MULTIPLY, 'NumPad_Multiply');
uiMap.define(KeyCode.NUMPAD_ADD, 'NumPad_Add');
uiMap.define(KeyCode.NUMPAD_SEPARATOR, 'NumPad_Separator');
uiMap.define(KeyCode.NUMPAD_SUBTRACT, 'NumPad_Subtract');
uiMap.define(KeyCode.NUMPAD_DECIMAL, 'NumPad_Decimal');
uiMap.define(KeyCode.NUMPAD_DIVIDE, 'NumPad_Divide');

export function keyCodeToStr(keyCode) {
    return uiMap.keyCodeToStr(keyCode);
}

export function strToKeyCode(str) {
    return uiMap.strToKeyCode(str.toLowerCase()) || KeyCode.Unknown;
}