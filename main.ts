import { FileSystemAdapter, Notice, Plugin } from 'obsidian';
import simpleGit, { SimpleGit } from 'simple-git';
import StatusBar from 'src/components/StatusBar';
import { SampleSettingTab, SyncViaGithubSettings } from 'src/settings';

export default class SyncViaGithub extends Plugin {
    settings: SyncViaGithubSettings;
    ribbonIcon: HTMLElement;
    statusBar: StatusBar;
    git: SimpleGit;

    onGithubIconClick = async (event: MouseEvent) => {
        await this.positiveSync();
    };

    updateStatusBarLocal = async () => {
        const status = await this.git.status();
        this.statusBar.updateChanges(status.files.length);
    };

    updateStatusBarRemote = async () => {
        const status = await this.git.fetch().status();
        this.statusBar.update(status.files.length, status.behind);
    };

    async onload() {
        this.initGit();
        await this.loadSettings();
        await this.initUI();
    }

    async positiveSync() {
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
    }

    onunload() { }

    async loadSettings() {
        this.settings = Object.assign(new SyncViaGithubSettings(), await this.loadData());
    }

    saveSettings() {
        return this.saveData(this.settings);
    }

    async initUI() {
        this.addSettingTab(new SampleSettingTab(this.app, this));
        this.ribbonIcon = this.addRibbonIcon('github', 'Github Sync', this.onGithubIconClick);
        this.statusBar = new StatusBar(this.addStatusBarItem());
        await this.updateStatusBarRemote();
        this.registerInterval(window.setInterval(this.updateStatusBarLocal, 1000));
        this.registerInterval(window.setInterval(this.updateStatusBarRemote, 1000 * 10));
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
