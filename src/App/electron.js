import App from './index';
import { remote } from 'electron';
import { commandManager } from '../commands';

export default class ElectronApp extends App {

    openDevTools() {
        remote.getCurrentWebContents().openDevTools();
    }

    componentDidMount() {
        super.componentDidMount();

        commandManager.registerCommand('openDevTools', this.openDevTools);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        commandManager.unregisterCommand('openDevTools');
    }

}