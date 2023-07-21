import { App, PluginSettingTab, Setting } from "obsidian";
import type TestPlugin from "../TestPlugin";
import { InfoModalType, TestPluginSettings } from "../helper/types";
import { clearClient, clearTokens, getClientId, getClientSecret, setClientId, setClientSecret, setTokenPassword } from "../helper/storage/localStorageHelper";
import { SettingsInfoModal } from "../modals/SettingsInfoModal";
import { codeFlowServerStart } from "../oauth/codeServerFlow";
import { isLoggedIn } from "../helper/storage/localStorageHelper";
import { pkceFlowLocalStart } from "../oauth/pkceLocalFlow";

/*
	This file contains the settings view of the plugin.
	The settings view is used customize the obsidian settings page of the plugin.
*/


/*
	Definition of the default settings of the plugin.
*/
export const DEFAULT_SETTINGS: TestPluginSettings = {
	encryptToken: true,
	useCustomClient: false,
	googleOAuthServer: 'https://google-auth-obsidian-redirect.vercel.app', // URL of the Obsidian Google Calendar Authorization Server
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
		// Use the async wrapper to get the client id and secret
		(async () => {
			this.clientId = await getClientId();
			this.clientSecret = await getClientSecret();
		})();
	}

	// This function is called when the settings view is opened
	async display(): Promise<void> {
		const { containerEl } = this;

		// Clear the settings container to prevent duplicate elements
		containerEl.empty();
		
		// Create a title for the settings page
		containerEl.createEl('h2', { text: 'Settings for OAuth test plugin.' });

		// Toggle to enable or disable the encryption of the tokens
		new Setting(containerEl)
			.setName('Protect google Login')
			.setDesc('This will encrypt the google login data with a password you set.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.encryptToken)
				toggle.onChange(async (value) => {
					if (value === false) {
						// Warn the user that this action will reduce the security of the plugin
						new SettingsInfoModal(this.app, InfoModalType.ENCRYPT_INFO).open();
					}
					// Store the state of the toggle in the settings
					this.plugin.settings.encryptToken = value;
					await this.plugin.saveSettings();
					// Clear all sensitive because it was not encrypted before 
					clearTokens();
					clearClient();
					// Make sure there is no encryption password set because the authorization is revoked
					setTokenPassword(null)
					this.display();
				});
			});

		// Toggle to switch between the public and custom client
		new Setting(containerEl)
			.setName("Use own authentication client")
			.setDesc("Please create your own client.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.useCustomClient)
					.onChange(async (value) => {
						if (value === false) {
							// Inform the user that the public client is only for testing
							new SettingsInfoModal(this.app, InfoModalType.USE_OWN_CLIENT).open();
						}
						// When switching clients revoke the authorization by clearing the tokens
						clearTokens();
						this.plugin.settings.useCustomClient = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		// Display the client id and secret if the custom client is used
		if (this.plugin.settings.useCustomClient) {
			// Setting to enter the client id
			new Setting(containerEl)
				.setName("ClientId")
				.setDesc("Google client id")
				.setClass("SubSettings")
				.addText((text) =>
					text
						.setPlaceholder("Enter your client id")
						.setValue(this.clientId)
						.onChange(value => {
							// only update the member variable when the value is changed to improve usability
							this.clientId = value.trim();
						})
				)


			// Setting to enter the client secret
			new Setting(containerEl)
				.setName("ClientSecret")
				.setDesc("Google client secret")
				.setClass("SubSettings")
				.addText((text) => {
					// Set input type to hide the password
					text.inputEl.type = "password";
					text
						.setPlaceholder("Enter your client secret")
						.setValue(this.clientSecret)
						.onChange(value => {
							// only update the member variable when the value is changed to improve usability
							this.clientSecret = value.trim();
						})
				})

			// Setting to save the client id and secret
			new Setting(containerEl)
				.setName("Save")
				.setDesc("Save the client id and secret")
				.setClass("SubSettings")
				.addButton((button) =>
					button
						.setButtonText("Save")
						.onClick(async () => {
							// Store the client id and secret in the local storage
							await setClientId(this.clientId);
							await setClientSecret(this.clientSecret);
							this.display();
						})
				);

		} else {
			// Setting to change the url of the authorization server if the public client is used
			new Setting(containerEl)
				.setName("Server url")
				.setDesc("The url to the server where the oauth takes place")
				.setClass("SubSettings")
				.addText(text => {
					text
						.setValue(this.oauthServer)
						.onChange(value => {
							// only update the member variable when the value is changed to improve usability
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

		/*
			Helper function to check if login button should be disabled
		*/
		const getLoginButtonStatus = async () => {
			if (this.plugin.settings.useCustomClient) {
				return (await getClientId() === '') || (await getClientSecret() === '');
			} else {
				return this.plugin.settings.googleOAuthServer === '';
			}
		}

		// Display the login button if the user is not logged in or the logout button if the user is logged in
		if (isLoggedIn()) {
			new Setting(containerEl)
				.setName("Logout")
				.setDesc("Logout from google")
				.addButton((button) => {
					button.setClass("login-with-google-btn") // Use a custom class to style the button according to the google design guidelines
					button.setButtonText("Sign out from Google")
					button.onClick(() => {
						// Logout/Revoke Authorization by clearing the tokens
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
					button.setClass("login-with-google-btn") // Use a custom class to style the button according to the google design guidelines
					button.setButtonText("Sign in with Google")
					button.onClick(() => {
						// Start the authorization process depending on the settings
						if (this.plugin.settings.useCustomClient) {
							pkceFlowLocalStart();
						} else {
							codeFlowServerStart();
						}
					})
				})
		}
	}
}