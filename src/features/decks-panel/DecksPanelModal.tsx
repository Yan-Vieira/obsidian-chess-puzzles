import { App, Modal } from "obsidian"
import { createRoot, Root } from "react-dom/client"
import DecksPanel from "./DecksPanel"
import { PuzzlesService } from "services/PuzzlesService"

export default class DecksPanelModal extends Modal {

    root?:Root

    puzzlesService:PuzzlesService

    constructor(app:App) {

        super(app)

        this.puzzlesService = new PuzzlesService(app)
    }

    async onOpen() {

        const decks = await this.puzzlesService.getAllDecks()

        this.root = createRoot(this.contentEl)

        this.root.render(<DecksPanel decks={decks}/>)
    }

    onClose(): void {
        
        this.root?.unmount()
    }
}