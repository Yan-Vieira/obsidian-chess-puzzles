import {Modal, Plugin} from 'obsidian';
import PuzzlesPanelModal from 'features/decks-panel/DecksPanelModal';
import ReviewPuzzleModal from 'features/review-puzzle/ReviewPuzzleModal';
import { ReviewType } from 'types/ReviewType';
import { registerChessPuzzleCodeBlockPostProcessor } from 'features/chess-puzzle-codeblock/registerChessPuzzleCodeBlockPostProcessor';
import { ChessPuzzlesSettings, ChessPuzzlesSettingTab, DEFAULT_SETTINGS } from 'settings';

export default class ChessPuzzles extends Plugin {

	modal?:Modal
	settings:ChessPuzzlesSettings = DEFAULT_SETTINGS

	async onload() {

		await this.loadSettings()

		this.addSettingTab(new ChessPuzzlesSettingTab(this.app, this))

		registerChessPuzzleCodeBlockPostProcessor(this, this.settings, () => this.saveSettings())

		this.addCommand({
			id: "chess-puzzles-review-pending-puzzles",
			name: "review pending puzzles",
			callback: () => {
				this.modal = new ReviewPuzzleModal(this.app, ReviewType.PENDING_PUZZLES, this.settings, () => this.saveSettings())
				this.modal.open()
			}
		})

		this.addCommand({
			id: "chess-puzzles-review-all-puzzles",
			name: "review all puzzles",
			callback: () => {
				this.modal = new ReviewPuzzleModal(this.app, ReviewType.ALL_PUZZLES, this.settings, () => this.saveSettings())
				this.modal.open()
			}
		})
		
		this.addCommand({
			id: "chess-puzzles-select-deck-to-review",
			name: "select a deck to review",
			callback: () => {
				this.modal = new PuzzlesPanelModal(this.app, this.settings, () => this.saveSettings())
				this.modal.open()
			}
		})
	}

	onunload() {

		this.modal?.close()
	}

	async loadSettings() {

		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {

		await this.saveData(this.settings)
	}
}
