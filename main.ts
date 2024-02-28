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
            const status = await this.getStatus();
            await this.configureRemote();
            await this.git.fetch();
            await this.pull();
            if (!status.isClean()) {
                const res = await this.git
                    .add('./*')
                    .commit(new Date().toUTCString())
                    .push('origin', status.current ?? 'main');
                new Notice(`GitHub Sync: pushed ${res.pushed}`);
            }
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

        this.addSettingTab(new SampleSettingTab(this.app, this));
        this.ribbonIcon = this.addRibbonIcon('github', 'Github Sync', this.onGithubIconClick);

        this.statusBar = this.addStatusBarItem();
        await this.updateStatusBar();
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
        new Notice(`GitHub Sync: pulled ${update.summary.changes} changes`);
        return update;
    }

    async getStatus() {
        try {
            return await this.git.status();
        } catch (e) {
            return await this.git.init().status();
        }
    }
}
