import GithubSyncMy from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { wrapTypePassword } from "./utils/wrapTypePassword";

export class GithubSyncMySettings {
	repositoryName = '';
	username = '';
	accessToken = '';
}

export class SampleSettingTab extends PluginSettingTab {
	plugin: GithubSyncMy;

	constructor(app: App, plugin: GithubSyncMy) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Github account or organization name')
			.addText(text => text
				.setPlaceholder('john-johnson')
				.setValue(this.plugin.settings.username)
				.onChange(async (value) => {
					this.plugin.settings.username = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Github repository name')
			.addText(text => text
				.setPlaceholder('example-repo')
				.setValue(this.plugin.settings.repositoryName)
				.onChange(async (value) => {
					this.plugin.settings.repositoryName = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Github personal access token')
			.addText(text => text
				.then(wrapTypePassword)
				.setPlaceholder('XXXXXXXXXXXXXXXXXXXXXXXXXXX')
				.setValue(this.plugin.settings.accessToken)
				.onChange(async (value) => {
					this.plugin.settings.accessToken = value;
					await this.plugin.saveSettings();
				}));
	}
}
