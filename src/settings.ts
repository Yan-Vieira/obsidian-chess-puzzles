import { App, PluginSettingTab, Setting } from "obsidian"
import type ChessPuzzles from "./main"
import moment from "moment"

export interface ChessPuzzlesSettings {
    decksFolder: string
    enableDailyReviewLimit: boolean
    dailyReviewLimit: number
    dailyReviewDate: string
    dailyReviewCount: number
}

export const DEFAULT_SETTINGS: ChessPuzzlesSettings = {
    decksFolder: "",
    enableDailyReviewLimit: false,
    dailyReviewLimit: 20,
    dailyReviewDate: "",
    dailyReviewCount: 0,
}

export class ChessPuzzlesSettingTab extends PluginSettingTab {

    plugin: ChessPuzzles

    constructor(app: App, plugin: ChessPuzzles) {

        super(app, plugin)

        this.plugin = plugin
    }

    display() {

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

        new Setting(containerEl)
            .setName("Limit daily reviews")
            .setDesc("Cap the number of puzzles you want to review each day.")
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.enableDailyReviewLimit)
                .onChange(async (value) => {

                    this.plugin.settings.enableDailyReviewLimit = value
                    await this.plugin.saveSettings()
                    this.display()
                })
            )

        new Setting(containerEl)
            .setName("Daily review limit")
            .setDesc("Maximum number of puzzles to include when the daily limit is enabled.")
            .addText((text) => text
                .setPlaceholder("20")
                .setValue(String(this.plugin.settings.dailyReviewLimit))
                .setDisabled(!this.plugin.settings.enableDailyReviewLimit)
                .onChange(async (value) => {

                    this.plugin.settings.dailyReviewLimit = normalizeDailyReviewLimit(value)
                    await this.plugin.saveSettings()
                })
            )

        if (this.plugin.settings.enableDailyReviewLimit) {

            const usage = getDailyReviewUsage(this.plugin.settings)

            new Setting(containerEl)
                .setName("Reviews completed today")
                .setDesc(`${usage.count} of ${this.plugin.settings.dailyReviewLimit}`)
        }
    }
}

export function getDailyReviewUsage(settings: ChessPuzzlesSettings) {

    const today = getToday()

    if (settings.dailyReviewDate !== today) {

        return {
            date: today,
            count: 0,
        }
    }

    return {
        date: settings.dailyReviewDate,
        count: settings.dailyReviewCount,
    }
}

export function getRemainingDailyReviews(settings: ChessPuzzlesSettings) {

    if (!settings.enableDailyReviewLimit) return Number.POSITIVE_INFINITY

    const usage = getDailyReviewUsage(settings)

    return Math.max(0, settings.dailyReviewLimit - usage.count)
}

export function recordDailyReview(settings: ChessPuzzlesSettings) {

    if (!settings.enableDailyReviewLimit) return

    const usage = getDailyReviewUsage(settings)

    settings.dailyReviewDate = usage.date
    settings.dailyReviewCount = usage.count + 1
}

function getToday() {

    return moment().format("YYYY-MM-DD")
}

function normalizeFolderPath(path: string) {

    return path.trim().replace(/^\/+|\/+$/g, "")
}

function normalizeDailyReviewLimit(value: string) {

    const parsed = Number(value)

    if (!Number.isFinite(parsed)) return DEFAULT_SETTINGS.dailyReviewLimit

    return Math.max(1, Math.floor(parsed))
}
