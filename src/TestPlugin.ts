import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SettingsView } from '../src/views/SettingsView';
import type { TestPluginSettings } from './helper/types';
import { pkceFlowLocalEnd, pkceFlowLocalStart } from './oauth/pkceLocalFlow';
import { clearTokens, isLoggedIn } from './helper/storage/localStorageHelper';
import { pkceFlowServerEnd, pkceFlowServerStart } from './oauth/pkceServerFlow';
import { getGoogleEvents } from './api/getEvents';

export default class TestPlugin extends Plugin {
	private static instance: TestPlugin;

	public static getInstance(): TestPlugin {
		return TestPlugin.instance;
	}

	settingsTab: SettingsView;
	settings: TestPluginSettings;
	private password: string;
	async onload() {
		TestPlugin.instance = this;

		await this.loadSettings();

		this.addCommand({
			id: 'testplugin-sample-command',
			name: 'TestPlugin Sample Command',
			callback: () => {
				console.log("Hello world!");
			}
		});

		this.addCommand({
			id: 'testplugin-logout',
			name: 'TestPlugin Logout',
			checkCallback: (checking: boolean) => {
				const canRun = isLoggedIn();
				if (checking) {
					return canRun;
				}
				if (!canRun) {
					return;
				}
				clearTokens();
			}
		});

		this.addCommand({
			id: 'testplugin-login-pkce-local',
			name: 'TestPlugin Login PKCE Local',
			checkCallback: (checking: boolean) => {
				const canRun = !isLoggedIn();
				if (checking) {
					return canRun;
				}
				if (!canRun) {
					return;
				}

				pkceFlowLocalStart();
			}
		});

		this.addCommand({
			id: 'testplugin-login-pkce-server',
			name: 'TestPlugin Login PKCE Server',
			checkCallback: (checking: boolean) => {
				const canRun = !isLoggedIn();
				if (checking) {
					return canRun;
				}
				if (!canRun) {
					return;
				}
				pkceFlowServerStart();
			}
		});

		this.addCommand({
			id: 'testplugin-get-events',
			name: 'TestPlugin Get Events',
			checkCallback: (checking: boolean) => {
				const canRun = isLoggedIn();
				if (checking) {
					return canRun;
				}
				if (!canRun) {
					return;
				}
				getGoogleEvents();
			}
		});

		this.settingsTab = new SettingsView(this.app, this)
		this.addSettingTab(this.settingsTab);

		// Register a custom protocol handler to get the code from the redirect url
		this.registerObsidianProtocolHandler("googleLogin", async (req) => {

			// Don't allow login if already logged in
			if (isLoggedIn()) return

			// Local PKCE flow to get the code and exchange it for a token
			if (req.code && req.state && req.scope === "https://www.googleapis.com/auth/calendar") {
				await pkceFlowLocalEnd(req.code, req.state)
				return;
			}

			// Server PKCE flow to get the token directly encrypted with public key of plugin
			if (req.token) {
				await pkceFlowServerEnd(req.token)
				return
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
