import { App, Modal, Notice } from "obsidian"
import { createRoot, Root } from "react-dom/client"
import { PuzzlesService } from "services/PuzzlesService"
import { ReviewType } from "types/ReviewType"
import ReviewPuzzle from "./ReviewPuzzle"
import ErrorBoundary from "features/error-boundary/ErrorBoundary"
import {
    ChessPuzzlesSettings,
    getRemainingDailyReviews,
    recordDailyReview,
} from "settings"

export default class ReviewPuzzleModal extends Modal {

    root?:Root
    puzzlesService:PuzzlesService
    reviewType:ReviewType
    settings:ChessPuzzlesSettings
    saveSettings: () => Promise<void>
    deck?:PuzzleDeck
    puzzle?:ChessPuzzle

    constructor(
        app:App,
        reviewType:ReviewType,
        settings:ChessPuzzlesSettings,
        saveSettings: () => Promise<void>,
        deck?:PuzzleDeck,
        puzzle?:ChessPuzzle
    ) {

        super(app)

        this.puzzlesService = new PuzzlesService(app, settings)
        this.reviewType = reviewType
        this.settings = settings
        this.saveSettings = saveSettings
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
        const preparedPuzzles = this.prepareReviewQueue(puzzles)

        if (!this.renderDailyLimitReachedIfNeeded(preparedPuzzles)) return

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={preparedPuzzles}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                    onPuzzleReviewed={() => this.recordReviewedPuzzle()}
                />
            </ErrorBoundary>
        )
    }

    private async reviewPendingPuzzles() {

        const puzzles = await this.puzzlesService.getPendingPuzzles()
        const preparedPuzzles = this.prepareReviewQueue(puzzles)

        if (puzzles.length <= 0) {

            this.contentEl.style = "display: flex; flex-direction: column; align-items: center;"

            this.contentEl.innerHTML = `
                <p>There's no pending puzzles.</p>
                <p>To review all puzzles regardless the due, use <strong>review all puzzles</strong> command.</p>
            `

            return;
        }

        if (!this.renderDailyLimitReachedIfNeeded(preparedPuzzles)) return

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={preparedPuzzles}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                    onPuzzleReviewed={() => this.recordReviewedPuzzle()}
                />
            </ErrorBoundary>
        )
    }

    private reviewSingleDeck() {

        if (!this.deck) {

            new Notice("Chess puzzles error: no deck selected.")

            return
        }

        const preparedPuzzles = this.prepareReviewQueue(this.deck.puzzles)

        if (!this.renderDailyLimitReachedIfNeeded(preparedPuzzles)) return

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={preparedPuzzles}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                    onPuzzleReviewed={() => this.recordReviewedPuzzle()}
                />
            </ErrorBoundary>
        )
    }

    private reviewSinglePuzzle() {

        if (!this.puzzle) {

            new Notice("Chess puzzles error: no puzzle selected.")

            return
        }

        if (this.settings.enableDailyReviewLimit && getRemainingDailyReviews(this.settings) <= 0) {

            this.renderDailyLimitReached()

            return
        }

        this.root = createRoot(this.contentEl)

        this.root.render(
            <ErrorBoundary>
                <ReviewPuzzle
                    puzzles={[this.puzzle]}
                    updatePuzzle={(puzzle) => this.puzzlesService.updateReviewFields(puzzle)}
                    onPuzzleReviewed={() => this.recordReviewedPuzzle()}
                />
            </ErrorBoundary>
        )
    }

    private prepareReviewQueue(puzzles: ChessPuzzle[]) {

        const shuffledPuzzles = shufflePuzzles(puzzles)

        if (!this.settings.enableDailyReviewLimit) return shuffledPuzzles

        return shuffledPuzzles.slice(0, getRemainingDailyReviews(this.settings))
    }

    private renderDailyLimitReachedIfNeeded(puzzles: ChessPuzzle[]) {

        if (!this.settings.enableDailyReviewLimit) return true
        if (puzzles.length > 0) return true

        this.renderDailyLimitReached()

        return false
    }

    private renderDailyLimitReached() {

        this.contentEl.style = "display: flex; flex-direction: column; align-items: center;"
        this.contentEl.empty()
        this.contentEl.createEl("p", { text: "You've reached your daily puzzle review limit." })
        this.contentEl.createEl("p", { text: "You can review more puzzles tomorrow." })
    }

    private async recordReviewedPuzzle() {

        recordDailyReview(this.settings)
        await this.saveSettings()
    }
}

const shufflePuzzles = (puzzles: ChessPuzzle[]) => {

    const shuffledPuzzles = [...puzzles]

    for (let i = shuffledPuzzles.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1))
        const currentPuzzle = shuffledPuzzles[i]
        const targetPuzzle = shuffledPuzzles[j]

        if (!currentPuzzle || !targetPuzzle) continue

        shuffledPuzzles[i] = targetPuzzle
        shuffledPuzzles[j] = currentPuzzle
    }

    return shuffledPuzzles
}
