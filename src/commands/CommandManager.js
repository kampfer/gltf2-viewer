export default class CommandManager {

    constructor() {
        this._commands = {};
    }

    getCommand(id) {
        return this._commands[id];
    }

    registerCommand(id, handle) {
        this._commands[id] = handle;
    }

    unregisterCommand(id) {
        delete this._commands[id];
    }

    executeCommand(id, ...args) {
        let command = this.getCommand(id);
        return command && command(...args);
    }

    destory() {

    }

}