import {Plugin} from 'obsidian';
import ReviewPuzzlesModal from 'review-puzzles-modal';

// Remember to rename these classes and interfaces!

export default class ChessPuzzles extends Plugin {

	modal?:ReviewPuzzlesModal

	async onload() {
		
		this.addCommand({
			id: "review-puzzles",
			name: "Review Puzzles",
			callback: () => {
				this.modal = new ReviewPuzzlesModal(this.app)
				this.modal.open()
			}
		})
	}

	onunload() {

		this.modal && this.modal.close()
	}
}