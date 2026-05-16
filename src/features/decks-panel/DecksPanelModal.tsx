import { App, Modal } from "obsidian"
import { createRoot, Root } from "react-dom/client"
import DecksPanel from "./DecksPanel"
import { PuzzlesService } from "services/PuzzlesService"
import ReviewPuzzleModal from "features/review-puzzle/ReviewPuzzleModal"
import { ReviewType } from "types/ReviewType"
import { ChessPuzzlesSettings } from "settings"

export default class DecksPanelModal extends Modal {

    root?:Root

    puzzlesService:PuzzlesService
    settings:ChessPuzzlesSettings

    constructor(app:App, settings:ChessPuzzlesSettings) {

        super(app)

        this.puzzlesService = new PuzzlesService(app, settings)
        this.settings = settings
    }

    async onOpen() {

        const decks = await this.puzzlesService.getAllDecks()

        this.root = createRoot(this.contentEl)

        this.root.render(<DecksPanel decks={decks} onItemClick={(deck) => this.goToPuzzleReviewModal(deck)}/>)
    }

    onClose(): void {
        
        this.root?.unmount()
    }

    private goToPuzzleReviewModal(deck:PuzzleDeck) {

        new ReviewPuzzleModal(this.app, ReviewType.SINGLE_DECK, this.settings, deck).open()

        this.close()
    }
}
