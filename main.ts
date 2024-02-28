import { Notice, Plugin } from 'obsidian';
import { SampleSettingTab, SyncViaGithubSettings } from 'src/settings';

export default class SyncViaGithub extends Plugin {
	settings: SyncViaGithubSettings;
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
		this.settings = Object.assign(new SyncViaGithubSettings(), await this.loadData());
	}

	saveSettings() {
		return this.saveData(this.settings);
	}
}
