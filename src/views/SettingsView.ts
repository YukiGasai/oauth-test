import { App, PluginSettingTab, Setting } from "obsidian";
import type TestPlugin from "../TestPlugin";
import type { TestPluginSettings } from "../helper/types";
import { setAccessToken, setExpirationTime, setRefreshToken } from "../helper/storage/localStorageHelper";
import { PasswordEnterModal } from "../modals/PasswordEnterModal";

export const DEFAULT_SETTINGS: TestPluginSettings = {
	encryptToken: false,
	useCustomClient: false,
	googleClientId: '',
	googleClientSecret: '',
	googleOAuthServer: 'https://google-auth-obsidian-redirect.vercel.app',
}

export class SettingsView extends PluginSettingTab {
	plugin: TestPlugin;

	constructor(app: App, plugin: TestPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for OAuth test plugin.' });

		new Setting(containerEl)
			.setName("Use own authentication client")
			.setDesc("Please create your own client.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.useCustomClient)
					.onChange(async (value) => {
						setRefreshToken("");
						setAccessToken("");
						setExpirationTime(0);
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
						.setValue(this.plugin.settings.googleClientId)
						.onChange(async (value) => {
							this.plugin.settings.googleClientId = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("ClientSecret")
				.setDesc("Google client secret")
				.setClass("SubSettings")
				.addText((text) =>
					text
						.setPlaceholder("Enter your client secret")
						.setValue(this.plugin.settings.googleClientSecret)
						.onChange(async (value) => {
							this.plugin.settings.googleClientSecret = value.trim();
							await this.plugin.saveSettings();
						})
				);

			if (this.plugin.settings.encryptToken) {
				// new Setting(containerEl)
				// 	.setName("Server url")
				// 	.setDesc("Save the config and encrypt the secrets")
				// 	.addButton((button) => {
				// 		button.onClick(async () => {
				// 			new PasswordEnterModal(this.app, (enteredPassword: string) => {

				// 				this.plugin.settings.googleClientId = aesGcmEncrypt(this.plugin.settings.googleClientId, enteredPassword);
				// 				this.plugin.settings.googleClientSecret = aesGcmEncrypt(this.plugin.settings.googleClientSecret, enteredPassword);
				// 				this.plugin.saveSettings();
				// 				this.display();
				// 			}).open();
				// 		});
				// 	});
			}
		} else {

			new Setting(containerEl)
				.setName("Server url")
				.setDesc("The url to the server where the oauth takes place")
				.setClass("SubSettings")
				.addText(text => {
					text
						.setValue(this.plugin.settings.googleOAuthServer)
						.onChange(async (value) => {
							this.plugin.settings.googleOAuthServer = value.trim();
							await this.plugin.saveSettings();
						})
				})

		}

		new Setting(containerEl)
			.setName('Protect google Login')
			.setDesc('This will encrypt the google login data with a password you set.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.encryptToken)
				toggle.onChange(async (value) => {
					this.plugin.settings.encryptToken = value;
					await this.plugin.saveSettings();
				});
			});
	}
}