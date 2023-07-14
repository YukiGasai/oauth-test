import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SettingsView } from '../src/views/SettingsView';
import type { TestPluginSettings } from './helper/types';
import { pkceFlowLocalEnd, pkceFlowLocalStart } from './oauth/pkceLocalFlow';
import { clearTokens, isLoggedIn } from './helper/storage/localStorageHelper';
import { codeFlowServerEnd, codeFlowServerStart } from './oauth/codeServerFlow';
import { getGoogleEvents } from './api/getEvents';
import { getGoogleCalendars } from './api/getCalendars';
import { aesGcmDecrypt, aesGcmEncrypt } from 'src/helper/crypt/aes';
import { scopeTest } from 'src/helper/scopeTest';

export default class TestPlugin extends Plugin {
	private static instance: TestPlugin;

	public static getInstance(): TestPlugin {
		return TestPlugin.instance;
	}

	settingsTab: SettingsView;
	settings: TestPluginSettings;
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
			name: 'TestPlugin Login with PKCE Local Flow',
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
			id: 'testplugin-login-code-server',
			name: 'TestPlugin Login with Code Server Flow',
			checkCallback: (checking: boolean) => {
				const canRun = !isLoggedIn();
				if (checking) {
					return canRun;
				}
				if (!canRun) {
					return;
				}
				codeFlowServerStart();
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

		this.addCommand({
			id: 'testplugin-get-calendars',
			name: 'TestPlugin Get Calendars',
			checkCallback: (checking: boolean) => {
				const canRun = isLoggedIn();
				if (checking) {
					return canRun;
				}
				if (!canRun) {
					return;
				}
				getGoogleCalendars();
			}
		});


		this.addCommand({
			id: 'testplugin-test-encryption',
			name: 'TestPlugin Test Encryption',
			checkCallback: (checking: boolean) => {
				const canRun = isLoggedIn();
				if (checking) {
					return canRun;
				}
				if (!canRun) {
					return;
				}

				(async () => {
					const password = "password"
					const text = "Hello World!"
					const encryptedText = await aesGcmEncrypt(text, password)
					console.log({ encryptedText })
					const decryptedText = await aesGcmDecrypt(encryptedText, password)
					console.log({ decryptedText })
				})();
			}
		});

		this.settingsTab = new SettingsView(this.app, this)
		this.addSettingTab(this.settingsTab);

		// Register a custom protocol handler to get the code from the redirect url
		this.registerObsidianProtocolHandler("googleLogin", async (req) => {

			// Don't allow login if already logged in
			if (isLoggedIn()) return

			// Check if the scope is valid
			if (!scopeTest(req.scope)) return

			// Local PKCE flow to get the code and exchange it for a token
			if (req.code && req.state) {
				await pkceFlowLocalEnd(req.code, req.state)
				return;
			}

			// Server Code flow to get the token directly encrypted with public key of plugin
			if (req.token) {
				await codeFlowServerEnd(req.token)
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
