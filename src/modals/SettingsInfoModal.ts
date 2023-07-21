import { App, Modal, Setting } from "obsidian";
import { InfoModalType } from "../helper/types";

/*
    Obsidian modal to display information to the user in a alert style.
    To make sure the information in this dialog is seen the user has to actively close the dialog.
*/

export class SettingsInfoModal extends Modal {

    // Type of the information to be displayed
    info: InfoModalType;
    constructor(app: App, info: InfoModalType) {
        super(app);
        this.info = info;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: "Google Calendar Alert" });
        if (this.info === InfoModalType.USE_OWN_CLIENT) {
            // Generate custom html elements on the container element instead of using the obsidian settings api to allow more customization
            contentEl.createEl("p", { text: "The public clients purpose is to be used as a testing mode for the plugin. After testing the plugin, please create a own client" });
            contentEl.createEl("a", { text: "Tutorial", href: "https://yukigasai.github.io/obsidian-google-calendar/#/Basics/Installation" });
        } else if (this.info === InfoModalType.ENCRYPT_INFO) {
            contentEl.createEl("p", { text: "You are switching the secret protection off. This will reduce the security of your credentials and is not recommended." });
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}