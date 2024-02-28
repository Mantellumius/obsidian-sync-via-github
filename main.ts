import { FileSystemAdapter, Plugin } from 'obsidian';
import simpleGit, { SimpleGit } from 'simple-git';
import { SampleSettingTab, SyncViaGithubSettings } from 'src/settings';

export default class SyncViaGithub extends Plugin {
	settings: SyncViaGithubSettings;
	ribbonIcon: HTMLElement;
	git: SimpleGit;


	onGithubIconClick = async (event: MouseEvent) => {
		console.log(await this.git.branch());
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.initGit();
		this.ribbonIcon = this.addRibbonIcon('github', 'Github Sync', this.onGithubIconClick);
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

	initGit() {
		this.git = simpleGit({
			baseDir: (this.app.vault.adapter as FileSystemAdapter).getBasePath(),
			binary: 'git',
			config: [
				`http.extraHeader=Authorization: Bearer ${this.settings.accessToken}`
			],
			maxConcurrentProcesses: 5,
			trimmed: false,
		});
	}
}
