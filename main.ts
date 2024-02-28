import { FileSystemAdapter, Notice, Plugin } from 'obsidian';
import simpleGit, { SimpleGit } from 'simple-git';
import { SampleSettingTab, SyncViaGithubSettings } from 'src/settings';

export default class SyncViaGithub extends Plugin {
    settings: SyncViaGithubSettings;
    ribbonIcon: HTMLElement;
    statusBar: HTMLElement;
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

    updateStatusBar = async () => {
        const status = await this.git.fetch().status();
        this.statusBar.setText(`Changes: ${status.not_added.length} ${status.behind > 0 ? 'Commits behind' + status.behind : ''}`);
    };

    async onload() {
        await this.loadSettings();
        this.initGit();
        await this.updateStatusBar();
        
        this.addSettingTab(new SampleSettingTab(this.app, this));
        this.ribbonIcon = this.addRibbonIcon('github', 'Github Sync', this.onGithubIconClick);
        this.statusBar = this.addStatusBarItem();
        this.registerInterval(window.setInterval(this.updateStatusBar, 1000 * 60));
    }

    onunload() { }

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
