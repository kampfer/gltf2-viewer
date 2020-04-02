import App from './index';
import { remote } from 'electron';
import { commandManager } from '../commands';

export default class ElectronApp extends App {

    closeWin() {
        remote.getCurrentWindow().close();
    }

    minimizeWin() {
        remote.getCurrentWindow().minimize();
    }
    
    restoreWin () {
        let win = remote.getCurrentWindow();
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
        
    }

    openDevTools() {
        remote.getCurrentWebContents().openDevTools();
    }

    componentDidMount() {
        super.componentDidMount();

        commandManager.registerCommand('openDevTools', this.openDevTools);
        commandManager.registerCommand('closeWin', this.closeWin);
        commandManager.registerCommand('minimizeWin', this.minimizeWin);
        commandManager.registerCommand('restoreWin', this.restoreWin);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        commandManager.unregisterCommand('openDevTools');
        commandManager.unregisterCommand('closeWin');
        commandManager.unregisterCommand('minimizeWin');
        commandManager.unregisterCommand('restoreWin');
    }

}