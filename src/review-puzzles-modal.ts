import { App, Modal } from "obsidian"

export default class ReviewPuzzlesModal extends Modal {
    constructor(app:App) {

        super(app)

        this.setContent("<h1>Review Puzzles</h1>")
    }
}