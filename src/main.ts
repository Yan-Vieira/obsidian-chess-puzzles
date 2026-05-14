import {Modal, Plugin} from 'obsidian';
import PuzzlesPanelModal from 'features/decks-panel/DecksPanelModal';
import ReviewPuzzleModal from 'features/review-puzzle/ReviewPuzzleModal';
import { ReviewType } from 'types/ReviewType';

export default class ChessPuzzles extends Plugin {

	modal?:Modal

	async onload() {

		this.addCommand({
			id: "chess-puzzles-review-all-puzzles",
			name: "review all puzzles",
			callback: () => {
				this.modal = new ReviewPuzzleModal(this.app, ReviewType.ALL_PUZZLES)
				this.modal.open()
			}
		})
		
		this.addCommand({
			id: "chess-puzzles-select-deck-to-review",
			name: "select a deck to review",
			callback: () => {
				this.modal = new PuzzlesPanelModal(this.app)
				this.modal.open()
			}
		})
	}

	onunload() {

		this.modal?.close()
	}
}
