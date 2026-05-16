import { App, Modal, Notice } from "obsidian"
import { createRoot, Root } from "react-dom/client"
import { PuzzlesService } from "services/PuzzlesService"
import { ReviewType } from "types/ReviewType"
import ReviewPuzzle from "./ReviewPuzzle"
import ErrorBoundary from "features/error-boundary/ErrorBoundary"

export default class ReviewPuzzleModal extends Modal {

    root?:Root
    puzzlesService:PuzzlesService
    reviewType:ReviewType

    constructor(app:App, reviewType:ReviewType) {

        super(app)

        this.puzzlesService = new PuzzlesService(app)
        this.reviewType = reviewType
    }

    onOpen() {

        try {
            
            switch (this.reviewType) {

                case ReviewType.ALL_PUZZLES:
                    this.reviewAllPuzzles()
                    break

                case ReviewType.PENDING_PUZZLES:
                    this.reviewPendingPuzzles()
                    break

                default: new Notice("No handler for the review type " + this.reviewType)
            }

        } catch (error) {
            
            console.log("Chess puzzles error: ", error)

            new Notice("Chess puzzles error: could not load review modal.")
        }

        
    }

    onClose(): void {
        
        this.root?.unmount()
    }

    private async reviewAllPuzzles() {

        const puzzles = await this.puzzlesService.getAllPuzzles()

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={puzzles}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                />
            </ErrorBoundary>
        )
    }

    private async reviewPendingPuzzles() {

        const puzzles = await this.puzzlesService.getPendingPuzzles()

        if (puzzles.length <= 0) {

            this.contentEl.style = "display: flex; flex-direction: column; align-items: center;"

            this.contentEl.innerHTML = `
                <p>There's no pending puzzles.</p>
                <p>To review all puzzles regardless the due, use <strong>review all puzzles</strong> command.</p>
            `

            return;
        }

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={puzzles}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                />
            </ErrorBoundary>
        )
    }
}
