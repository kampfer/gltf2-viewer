export default class CommandManager {

    constructor() {
        this._commands = {};
    }

    getCommand(name) {
        return this._commands[name];
    }

    registerCommand(name, handle) {
        this._commands[name] = handle;
    }

    unregisterCommand(name) {
        delete this._commands[name];
    }

    destory() {

    }

}