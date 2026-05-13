import {Plugin} from 'obsidian';
import PuzzlesPanelModal from 'features/decks-panel/DecksPanelModal';

// Remember to rename these classes and interfaces!

export default class ChessPuzzles extends Plugin {

	puzzlesPanelModal?:PuzzlesPanelModal

	async onload() {
		
		this.addCommand({
			id: "chess-puzzles-select-deck-to-review",
			name: "select deck to review",
			callback: () => {
				this.puzzlesPanelModal = new PuzzlesPanelModal(this.app)
				this.puzzlesPanelModal.open()
			}
		})
	}

	onunload() {

		this.puzzlesPanelModal?.close()
	}
}