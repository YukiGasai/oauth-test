import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SettingsView } from '../src/views/SettingsView';
import type { TestPluginSettings } from './helper/types';
import { pkceFlowLocalEnd, pkceFlowLocalStart } from '../src/oauth/pkceFlow';


export default class TesPlugin extends Plugin {
	private static instance: TesPlugin;

	public static getInstance(): TesPlugin {
		return TesPlugin.instance;
	}


	settings: TestPluginSettings;

	async onload() {
		TesPlugin.instance = this;

		await this.loadSettings();

		this.addCommand({
			id: 'testplugin-sample-command',
			name: 'TestPlugin Sample Command',
			callback: () => {
				console.log("Hello world!");
			}
		});


		this.addCommand({
			id: 'testplugin-login-pkce',
			name: 'TestPlugin Login PKCE',
			callback: () => {
				pkceFlowLocalStart();
			}
		});

		this.addSettingTab(new SettingsView(this.app, this));

		// Register a custom protocol handler to get the code from the redirect url
		this.registerObsidianProtocolHandler("googleLogin", async (req) => {
			if (req.code && req.state && req.scope === "https://www.googleapis.com/auth/calendar") {
				pkceFlowLocalEnd(req.code, req.state)
			}
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
