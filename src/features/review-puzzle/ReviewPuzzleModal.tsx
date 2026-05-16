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
    deck?:PuzzleDeck
    puzzle?:ChessPuzzle

    constructor(app:App, reviewType:ReviewType, deck?:PuzzleDeck, puzzle?:ChessPuzzle) {

        super(app)

        this.puzzlesService = new PuzzlesService(app)
        this.reviewType = reviewType
        this.deck = deck
        this.puzzle = puzzle
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

                case ReviewType.SINGLE_DECK:
                    this.reviewSingleDeck()
                    break

                case ReviewType.SINGLE_PUZZLE:
                    this.reviewSinglePuzzle()
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

    private reviewSingleDeck() {

        if (!this.deck) {

            new Notice("Chess puzzles error: no deck selected.")

            return
        }

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={this.deck.puzzles}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                />
            </ErrorBoundary>
        )
    }

    private reviewSinglePuzzle() {

        if (!this.puzzle) {

            new Notice("Chess puzzles error: no puzzle selected.")

            return
        }

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={[this.puzzle]}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                />
            </ErrorBoundary>
        )
    }
}
