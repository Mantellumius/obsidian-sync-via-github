import { FileSystemAdapter, Notice, Plugin } from 'obsidian';
import simpleGit, { SimpleGit } from 'simple-git';
import { SampleSettingTab, SyncViaGithubSettings } from 'src/settings';

export default class SyncViaGithub extends Plugin {
    settings: SyncViaGithubSettings;
    ribbonIcon: HTMLElement;
    git: SimpleGit;

    onGithubIconClick = async (event: MouseEvent) => {
        try {
            await this.git.status();
            await this.configureRemote();
            try {
                await this.git.fetch();
            } catch (e) {
                new Notice(e + '\nGitHub Sync: Invalid remote URL. Username, PAT, or Repo URL might be incorrect.');
                return;
            }
            await this.pull();
        } catch (e) {
            new Notice('GitHub Sync: ' + e.message);
            console.error(e);
        }
    };

    async onload() {
        await this.loadSettings();
        await this.initGit();

        this.addSettingTab(new SampleSettingTab(this.app, this));
        this.ribbonIcon = this.addRibbonIcon('github', 'Github Sync', this.onGithubIconClick);
        this.registerInterval(window.setInterval(async () => {
            const status = await this.git.fetch().status();
            this.ribbonIcon.dataset.commitsBehind = status.behind.toString();
            if (status.behind > 0)
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

    async initGit() {
        this.git = simpleGit({
            baseDir: (this.app.vault.adapter as FileSystemAdapter).getBasePath(),
            binary: 'git',
            maxConcurrentProcesses: 5,
            trimmed: false,
        });
    }

    async configureRemote() {
        await this.git.removeRemote('origin');
        await this.git.addRemote('origin', this.settings.remote);
    }

    async pull() {
        const update = await this.git.pull('origin', 'main', { '--no-rebase': null });
        new Notice('GitHub Sync: Pulled ' + update.summary.changes + ' changes');
        return update;
    }
}
