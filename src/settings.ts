import { App, PluginSettingTab, Setting } from "obsidian"
import type ChessPuzzles from "./main"

export interface ChessPuzzlesSettings {
    decksFolder: string
}

export const DEFAULT_SETTINGS: ChessPuzzlesSettings = {
    decksFolder: "",
}

export class ChessPuzzlesSettingTab extends PluginSettingTab {

    plugin: ChessPuzzles

    constructor(app: App, plugin: ChessPuzzles) {

        super(app, plugin)

        this.plugin = plugin
    }

    display(): void {

        const { containerEl } = this

        containerEl.empty()

        new Setting(containerEl)
            .setName("Decks folder")
            .setDesc("Folder where chess puzzle decks are stored. Leave empty to search the whole vault.")
            .addText((text) => text
                .setPlaceholder("folder/path")
                .setValue(this.plugin.settings.decksFolder)
                .onChange(async (value) => {

                    this.plugin.settings.decksFolder = normalizeFolderPath(value)
                    await this.plugin.saveSettings()
                })
            )
    }
}

function normalizeFolderPath(path: string) {

    return path.trim().replace(/^\/+|\/+$/g, "")
}
