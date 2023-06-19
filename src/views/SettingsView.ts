import { App, PluginSettingTab, Setting } from "obsidian";
import type TestPlugin from "../TestPlugin";
import { InfoModalType, TestPluginSettings } from "../helper/types";
import { clearClient, clearTokens, getClientId, getClientSecret, setClientId, setClientSecret, setTokenPassword } from "../helper/storage/localStorageHelper";
import { SettingsInfoModal } from "../modals/SettingsInfoModal";
import { pkceFlowServerStart } from "../oauth/pkceServerFlow";
import { isLoggedIn } from "../helper/storage/localStorageHelper";
import { pkceFlowLocalStart } from "../oauth/pkceLocalFlow";

export const DEFAULT_SETTINGS: TestPluginSettings = {
	encryptToken: true,
	useCustomClient: false,
	googleOAuthServer: 'https://google-auth-obsidian-redirect.vercel.app',
}

export class SettingsView extends PluginSettingTab {
	plugin: TestPlugin;
	clientId: string;
	clientSecret = '';
	oauthServer = '';

	constructor(app: App, plugin: TestPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.oauthServer = this.plugin.settings.googleOAuthServer;
		(async () => {
			this.clientId = await getClientId();
			this.clientSecret = await getClientSecret();
		})();
	}

	async display(): Promise<void> {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for OAuth test plugin.' });

		new Setting(containerEl)
			.setName('Protect google Login')
			.setDesc('This will encrypt the google login data with a password you set.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.encryptToken)
				toggle.onChange(async (value) => {
					if (value === false) {
						new SettingsInfoModal(this.app, InfoModalType.ENCRYPT_INFO).open();
					}
					this.plugin.settings.encryptToken = value;
					await this.plugin.saveSettings();
					clearTokens();
					clearClient();
					setTokenPassword(null)
					this.display();
				});
			});

		new Setting(containerEl)
			.setName("Use own authentication client")
			.setDesc("Please create your own client.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.useCustomClient)
					.onChange(async (value) => {
						if (value === false) {
							new SettingsInfoModal(this.app, InfoModalType.USE_OWN_CLIENT).open();
						}
						clearTokens();
						this.plugin.settings.useCustomClient = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		if (this.plugin.settings.useCustomClient) {

			new Setting(containerEl)
				.setName("ClientId")
				.setDesc("Google client id")
				.setClass("SubSettings")
				.addText((text) =>
					text
						.setPlaceholder("Enter your client id")
						.setValue(this.clientId)
						.onChange(value => {
							this.clientId = value.trim();
						})
				)


			new Setting(containerEl)
				.setName("ClientSecret")
				.setDesc("Google client secret")
				.setClass("SubSettings")
				.addText((text) => {
					text.inputEl.type = "password";
					text
						.setPlaceholder("Enter your client secret")
						.setValue(this.clientSecret)
						.onChange(value => {
							this.clientSecret = value.trim();
						})
				})

			new Setting(containerEl)
				.setName("Save")
				.setDesc("Save the client id and secret")
				.setClass("SubSettings")
				.addButton((button) =>
					button
						.setButtonText("Save")
						.onClick(async () => {
							await setClientId(this.clientId);
							await setClientSecret(this.clientSecret);
							this.display();
						})
				);

		} else {

			new Setting(containerEl)
				.setName("Server url")
				.setDesc("The url to the server where the oauth takes place")
				.setClass("SubSettings")
				.addText(text => {
					text
						.setValue(this.oauthServer)
						.onChange(value => {
							this.oauthServer = value.trim();
						})
				})
				.addButton((button) =>
					button
						.setButtonText("Save")
						.onClick(async () => {
							this.plugin.settings.googleOAuthServer = this.oauthServer;
							await this.plugin.saveSettings();
							this.display();
						})
				);

		}

		const getLoginButtonStatus = async () => {
			if (this.plugin.settings.useCustomClient) {
				return (await getClientId() === '') || (await getClientSecret() === '');
			} else {
				return this.plugin.settings.googleOAuthServer === '';
			}
		}

		if (isLoggedIn()) {
			new Setting(containerEl)
				.setName("Logout")
				.setDesc("Logout from google")
				.addButton((button) => {
					button.setClass("login-with-google-btn")
					button.setButtonText("Sign out from Google")
					button.onClick(() => {
						clearTokens();
						this.display();
					})
				})
		} else {
			const buttonState = await getLoginButtonStatus()
			new Setting(containerEl)
				.setName("Login")
				.setDesc("Login with google")
				.addButton((button) => {
					button.setDisabled(buttonState)
					button.setClass("login-with-google-btn")
					button.setButtonText("Sign in with Google")
					button.onClick(() => {
						if (this.plugin.settings.useCustomClient) {
							pkceFlowLocalStart();
						} else {
							pkceFlowServerStart();
						}
					})
				})
		}

	}
}