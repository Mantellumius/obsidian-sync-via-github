import { Notice, Plugin } from 'obsidian';
import { GithubSyncMySettings, SampleSettingTab } from 'src/settings';

export default class GithubSyncMy extends Plugin {
	settings: GithubSyncMySettings;
	ribbonIcon: HTMLElement;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.ribbonIcon = this.addRibbonIcon('github', 'Github Sync', (evt: MouseEvent) => {
			new Notice('Hello world');
		});

		this.registerInterval(window.setInterval(() => {
			const commitsBehind = 1;
			this.ribbonIcon.dataset.commitsBehind = commitsBehind.toString();
			if (commitsBehind > 0)
				this.ribbonIcon.addClass('not-synced');
			else
				this.ribbonIcon.removeClass('not-synced');
		}, 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign(new GithubSyncMySettings(), await this.loadData());
	}

	saveSettings() {
		return this.saveData(this.settings);
	}
}
