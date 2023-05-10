import { App, Modal, Notice, Setting } from "obsidian";

export class PasswordSetupModal extends Modal {

    password = '';
    passwordConfirm = '';
    setPassword: (password: string) => void;

    constructor(app: App, setPassword: (password: string) => void) {
        super(app);
        this.setPassword = setPassword;
    }

    onOpen() {
        const { contentEl } = this;
        new Setting(contentEl)
            .setName('Password')
            .setDesc('Enter your password')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('Password')
                text.onChange(async (value) => {
                    this.password = value;
                });
            });

        new Setting(contentEl)
            .setName('Confirm Password')
            .setDesc('Confirm your password')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('Password')
                text.onChange(async (value) => {
                    this.passwordConfirm = value;
                });
            });

        new Setting(contentEl)
            .setName('Submit')
            .setDesc('Submit your password')
            .addButton(button => {
                button.setButtonText('Submit')
                button.onClick(async (evt) => {
                    if (this.password !== this.passwordConfirm) {
                        new Notice('Passwords do not match');
                        return;
                    }
                    this.close();
                });
            });
    }

    onClose() {
        const { contentEl } = this;
        this.setPassword(this.password)
        contentEl.empty();
    }
}